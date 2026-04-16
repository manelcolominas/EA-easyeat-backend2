import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/review';
import { DishModel } from '../models/dish';
import { RestaurantModel } from '../models/restaurant';
import { CustomerModel } from '../models/customer';

// ─────────────────────────────────────────────────────────────────────────────
// Constants / Types
// ─────────────────────────────────────────────────────────────────────────────

const MAX_DISH_RATINGS_PER_CUSTOMER = 2;
const ACTIVE_REVIEW_FILTER = { deletedAt: null, deleted: { $ne: true } };

type NormalizedDishRating = {
  dish_id: mongoose.Types.ObjectId;
  rating: number;
};

type DishRatingStats = {
  averageRating: number;
  totalRatings: number;
  firstRatingAt: Date;
};

export interface IRestaurantTopDishResponse {
  restaurant: {
    _id: string;
    name?: string;
  };
  topDish: {
    dishId: string;
    name: string;
    images: string[];
    averageRating: number;
    totalRatings: number;
    firstRatingAt: Date;
  } | null;
  tieBreakPolicy: string;
  message?: string;
}

export interface IRestaurantDishRatingsResponse {
  restaurant: {
    _id: string;
    name?: string;
  };
  dishes: Array<{
    dishId: string;
    name: string;
    images: string[];
    averageRating: number;
    totalRatings: number;
  }>;
}

export interface ICustomerReviewListResponse {
  data: IReview[];
  total: number;
}

const normalizeDishRatings = (review: Partial<IReview>): NormalizedDishRating[] => {
  if (Array.isArray(review.dishRatings) && review.dishRatings.length > 0) {
    return review.dishRatings.map((item) => ({
      dish_id: new mongoose.Types.ObjectId(item.dish_id),
      rating: item.rating
    }));
  }

  return [];
};

const getRestaurantDishRatings = async (restaurantId: mongoose.Types.ObjectId): Promise<Array<{ dishId: string; rating: number; createdAt: Date }>> => {
  const reviews = await ReviewModel.find({
    restaurant_id: restaurantId,
    ...ACTIVE_REVIEW_FILTER
  })
    .select('dishRatings createdAt')
    .lean<Partial<IReview>[]>();

  return reviews.flatMap((review) => {
    const createdAt = review.createdAt ?? new Date(0);

    return normalizeDishRatings(review).map((item) => ({
      dishId: String(item.dish_id),
      rating: item.rating,
      createdAt
    }));
  });
};

const buildStatsByDish = (ratings: Array<{ dishId: string; rating: number; createdAt: Date }>): Map<string, DishRatingStats> => {
  const stats = new Map<string, DishRatingStats>();

  for (const rating of ratings) {
    const current = stats.get(rating.dishId);

    if (!current) {
      stats.set(rating.dishId, {
        averageRating: rating.rating,
        totalRatings: 1,
        firstRatingAt: rating.createdAt
      });
      continue;
    }

    const nextTotalRatings = current.totalRatings + 1;
    const nextAverage = ((current.averageRating * current.totalRatings) + rating.rating) / nextTotalRatings;

    stats.set(rating.dishId, {
      averageRating: nextAverage,
      totalRatings: nextTotalRatings,
      firstRatingAt: current.firstRatingAt < rating.createdAt ? current.firstRatingAt : rating.createdAt
    });
  }

  return stats;
};

const getActiveRestaurantById = async (restaurantId: mongoose.Types.ObjectId) => {
  return RestaurantModel.findById(restaurantId).active().lean();
};

export class ReviewServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ========================
// RECALCULATE DISH RATINGS
// ========================
const recalculateDishRatingsByRestaurant = async (
  restaurantId: mongoose.Types.ObjectId
): Promise<void> => {
  const ratings = await getRestaurantDishRatings(restaurantId);
  const stats = buildStatsByDish(ratings);

  await DishModel.updateMany(
    { restaurant_id: restaurantId },
    { $set: { userRatingAvg: 0, userRatingCount: 0 } }
  );

  if (!stats.size) return;

  await DishModel.bulkWrite(
    [...stats.entries()].map(([dishId, stat]) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(dishId), restaurant_id: restaurantId },
        update: {
          $set: {
            userRatingAvg: Number(stat.averageRating.toFixed(2)),
            userRatingCount: stat.totalRatings
          }
        }
      }
    }))
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

// ========================
// CREATE
// ========================
const createReview = async (data: Partial<IReview>): Promise<IReview> => {
  if (!data.customer_id || !data.restaurant_id) {
    throw new ReviewServiceError(400, 'customer_id and restaurant_id are required');
  }

  const normalizedRatings = normalizeDishRatings(data);
  const hasDishRatings = normalizedRatings.length > 0;

  if (
    (data.globalRating === undefined || data.globalRating === null) &&
    !hasDishRatings
  ) {
    throw new ReviewServiceError(400, 'globalRating is required when no dish rating is provided');
  }

  if (hasDishRatings && normalizedRatings.length > MAX_DISH_RATINGS_PER_CUSTOMER) {
    throw new ReviewServiceError(409, `Each customer can rate up to ${MAX_DISH_RATINGS_PER_CUSTOMER} dishes`);
  }

  const customerId = new mongoose.Types.ObjectId(data.customer_id);
  const restaurantId = new mongoose.Types.ObjectId(data.restaurant_id);

  const [customer, restaurant] = await Promise.all([
    CustomerModel.findById(customerId).active(),
    getActiveRestaurantById(restaurantId)
  ]);

  if (!customer) throw new ReviewServiceError(404, 'Customer not found');
  if (!restaurant) throw new ReviewServiceError(404, 'Restaurant not found');

  if (hasDishRatings) {
    const dishIdsInPayload = normalizedRatings.map((rating) => String(rating.dish_id));
    if (new Set(dishIdsInPayload).size !== dishIdsInPayload.length) {
      throw new ReviewServiceError(409, 'Duplicate dish_id values are not allowed in dishRatings');
    }

    const customerReviews = await ReviewModel.find({
      customer_id: customerId,
      ...ACTIVE_REVIEW_FILTER
    })
      .select('dishRatings')
      .lean<Partial<IReview>[]>();

    const alreadyRatedDishIds = new Set(
      customerReviews.flatMap((review) => normalizeDishRatings(review).map((rating) => String(rating.dish_id)))
    );

    for (const rating of normalizedRatings) {
      if (alreadyRatedDishIds.has(String(rating.dish_id))) {
        throw new ReviewServiceError(409, 'This customer has already rated one of these dishes');
      }
    }

    const totalRatingsAfterSave = alreadyRatedDishIds.size + normalizedRatings.length;
    if (totalRatingsAfterSave > MAX_DISH_RATINGS_PER_CUSTOMER) {
      throw new ReviewServiceError(409, `Each customer can rate up to ${MAX_DISH_RATINGS_PER_CUSTOMER} dishes`);
    }

    const dishIds = normalizedRatings.map((rating) => rating.dish_id);
    const dishes = await DishModel.find({
      _id: { $in: dishIds },
      restaurant_id: restaurantId
    })
      .select('_id')
      .lean();

    if (dishes.length !== dishIds.length) {
      throw new ReviewServiceError(404, 'One or more dishes were not found for this restaurant');
    }
  }

  if ((data.globalRating === undefined || data.globalRating === null) && hasDishRatings) {
    data.globalRating = normalizedRatings[0].rating;
  }

  const reviewPayload: Partial<IReview> = {
    ...data,
    customer_id: customerId,
    restaurant_id: restaurantId
  };

  if (!reviewPayload.images) {
    reviewPayload.images = [];
  }

  if (hasDishRatings) {
    reviewPayload.dishRatings = normalizedRatings;
  }

  const review = new ReviewModel(reviewPayload);

  const savedReview = await review.save();

  if (hasDishRatings) {
    await recalculateDishRatingsByRestaurant(restaurantId);
  }

  return savedReview;
};

// ========================
// GET ONE
// ========================
const getReview = async (review_id: string): Promise<IReview | null> => {
  if (!mongoose.Types.ObjectId.isValid(review_id)) return null;

  return ReviewModel.findOne({ _id: review_id, ...ACTIVE_REVIEW_FILTER })
    .populate('customer_id', 'name profilePictures')
    .populate('restaurant_id', 'name')
    .lean();
};

// ========================
// GET ALL
// ========================
const getAllReviews = async (): Promise<IReview[]> => {
  return ReviewModel.find({ ...ACTIVE_REVIEW_FILTER })
    .populate('customer_id', 'name')
    .populate('restaurant_id', 'name')
    .lean();
};

// ========================
// UPDATE
// ========================
const updateReview = async (review_id: string, data: Partial<IReview>): Promise<IReview | null> => {
  if (!mongoose.Types.ObjectId.isValid(review_id)) return null;

  delete data._id;
  delete data.customer_id;
  delete data.restaurant_id;
  delete data.dishRatings;

  const updated = await ReviewModel.findOneAndUpdate(
    { _id: review_id, ...ACTIVE_REVIEW_FILTER },
    data,
    { new: true }
  ).lean();

  if (updated) {
    await recalculateDishRatingsByRestaurant(
      new mongoose.Types.ObjectId(updated.restaurant_id)
    );
  }

  return updated;
};

// ========================
// DELETE
// ========================
const deleteReview = async (review_id: string): Promise<IReview | null> => {
  if (!mongoose.Types.ObjectId.isValid(review_id)) return null;

  const deleted = await ReviewModel.findOneAndUpdate(
    { _id: review_id, ...ACTIVE_REVIEW_FILTER },
    { deletedAt: new Date(), deleted: true },
    { new: true }
  ).lean();

  if (deleted) {
    await recalculateDishRatingsByRestaurant(
      new mongoose.Types.ObjectId(deleted.restaurant_id)
    );
  }

  return deleted;
};

// ========================
// BY RESTAURANT
// ========================
const getReviewsByRestaurant = async (restaurant_id: string): Promise<IReview[]> => {
  return ReviewModel.find({
    restaurant_id: new mongoose.Types.ObjectId(restaurant_id),
    ...ACTIVE_REVIEW_FILTER
  })
    .populate('customer_id', 'name profilePictures')
    .lean();
};

// ========================
// BY CUSTOMER
// ========================
const getReviewsByCustomer = async (
  customer_id: string,
  limit = 5,
  skip = 0,
  minGlobalRating?: number,
  sortByLikes?: boolean
): Promise<ICustomerReviewListResponse> => {
  if (!mongoose.Types.ObjectId.isValid(customer_id)) {
    return { data: [], total: 0 };
  }

  const filter: Record<string, unknown> = {
    customer_id: new mongoose.Types.ObjectId(customer_id),
    ...ACTIVE_REVIEW_FILTER
  };

  if (minGlobalRating !== undefined) {
    filter.globalRating = { $gte: minGlobalRating };
  }

  const sort: Record<string, 1 | -1> = sortByLikes ? { likes: -1 } : { createdAt: -1 };

  const [reviews, total] = await Promise.all([
    ReviewModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'restaurant_id',
        select: 'profile'
      })
      .lean(),
    ReviewModel.countDocuments(filter)
  ]);

  return {
    data: reviews.map((review: any) => ({
      ...review,
      restaurant_id: {
        _id: review.restaurant_id._id,
        name: review.restaurant_id.profile?.name
      }
    })),
    total
  };
};

// ========================
// LIKE
// ========================
const likeReview = async (review_id: string): Promise<IReview | null> => {
  if (!mongoose.Types.ObjectId.isValid(review_id)) return null;

  return ReviewModel.findOneAndUpdate(
    { _id: review_id, ...ACTIVE_REVIEW_FILTER },
    { $inc: { likes: 1 } },
    { new: true }
  ).lean();
};

// ========================
// TOP DISH
// ========================
const getRestaurantTopDish = async (restaurantId: string): Promise<IRestaurantTopDishResponse> => {
  const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

  const restaurant = await getActiveRestaurantById(restaurantObjectId);
  if (!restaurant) throw new ReviewServiceError(404, 'Restaurant not found');

  const ratings = await getRestaurantDishRatings(restaurantObjectId);
  const stats = buildStatsByDish(ratings);

  if (!stats.size) {
    return {
      restaurant: {
        _id: String(restaurant._id),
        name: restaurant.profile?.name
      },
      topDish: null,
      tieBreakPolicy: 'averageRating desc, totalRatings desc, firstRatingAt asc',
      message: 'No dish ratings found for this restaurant'
    };
  }

  const dishes = await DishModel.find({ restaurant_id: restaurantObjectId })
    .select('_id name images')
    .lean();

  const rankedDishes = dishes
    .map((dish) => {
      const stat = stats.get(String(dish._id));

      if (!stat) return null;

      return {
        dish,
        averageRating: stat.averageRating,
        totalRatings: stat.totalRatings,
        firstRatingAt: stat.firstRatingAt
      };
    })
    .filter(Boolean) as Array<{
      dish: { _id: mongoose.Types.ObjectId; name: string; images?: string[] };
      averageRating: number;
      totalRatings: number;
      firstRatingAt: Date;
    }>;

  rankedDishes.sort((left, right) => {
    if (right.averageRating !== left.averageRating) return right.averageRating - left.averageRating;
    if (right.totalRatings !== left.totalRatings) return right.totalRatings - left.totalRatings;
    return left.firstRatingAt.getTime() - right.firstRatingAt.getTime();
  });

  return {
    restaurant: {
      _id: String(restaurant._id),
      name: restaurant.profile?.name
    },
    topDish: rankedDishes[0]
      ? {
          dishId: String(rankedDishes[0].dish._id),
          name: rankedDishes[0].dish.name,
          images: rankedDishes[0].dish.images ?? [],
          averageRating: Number(rankedDishes[0].averageRating.toFixed(2)),
          totalRatings: rankedDishes[0].totalRatings,
          firstRatingAt: rankedDishes[0].firstRatingAt
        }
      : null,
    tieBreakPolicy: 'averageRating desc, totalRatings desc, firstRatingAt asc'
  };
};

// ========================
// DISHES WITH RATINGS
// ========================
const getRestaurantDishesWithRatings = async (restaurantId: string): Promise<IRestaurantDishRatingsResponse> => {
  const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

  const restaurant = await getActiveRestaurantById(restaurantObjectId);
  if (!restaurant) throw new ReviewServiceError(404, 'Restaurant not found');

  const dishes = await DishModel.find({ restaurant_id: restaurantObjectId }).lean();

  const ratings = await getRestaurantDishRatings(restaurantObjectId);
  const stats = buildStatsByDish(ratings);

  return {
    restaurant: {
      _id: String(restaurant._id),
      name: restaurant.profile?.name
    },
    dishes: dishes.map(d => {
    const stat = stats.get(String(d._id));
    return {
      dishId: String(d._id),
      name: d.name,
      images: d.images ?? [],
      averageRating: stat ? Number(stat.averageRating.toFixed(2)) : 0,
      totalRatings: stat?.totalRatings || 0
    };
  }).sort((left, right) => {
    if (right.averageRating !== left.averageRating) return right.averageRating - left.averageRating;
    if (right.totalRatings !== left.totalRatings) return right.totalRatings - left.totalRatings;
    return left.name.localeCompare(right.name);
  })
  };
};

export default {
  createReview,
  getReview,
  getAllReviews,
  updateReview,
  deleteReview,
  getReviewsByRestaurant,
  getReviewsByCustomer,
  likeReview,
  getRestaurantTopDish,
  getRestaurantDishesWithRatings
};
