import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/review';
<<<<<<< dishRating
=======
import { DishModel } from '../models/dish';
import { RestaurantModel } from '../models/restaurant';
import { CustomerModel } from '../models/customer';

// ─────────────────────────────────────────────────────────────────────────────
// Constants / Types
// ─────────────────────────────────────────────────────────────────────────────

const MAX_DISH_RATINGS_PER_CUSTOMER = 2;
const ACTIVE_REVIEW_FILTER = { deletedAt: null, deleted: { $ne: true } };
const INCTIVE_REVIEW_FILTER = { deletedAt: { $ne: null }, deleted: { $ne: false } };

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
    return review.dishRatings.map((dishRating) => ({
      dish_id: new mongoose.Types.ObjectId(dishRating.dish_id),
      rating: dishRating.rating
    }));
  }

  if (review.dish_id && review.dishRating !== undefined && review.dishRating !== null) {
    return [{
      dish_id: new mongoose.Types.ObjectId(review.dish_id),
      rating: review.dishRating
    }];
  }

  return [];
};

const getRestaurantDishRatings = async (restaurantId: mongoose.Types.ObjectId): Promise<Array<{ dishId: string; rating: number; createdAt: Date }>> => {
  const reviews = await ReviewModel.find({
    restaurant_id: restaurantId,
    ...ACTIVE_REVIEW_FILTER
  })
    .select('dishRatings dish_id dishRating createdAt')
    .lean<Partial<IReview>[]>();

  return reviews.flatMap((review) => {
    const createdAt = review.createdAt ?? new Date(0);

    return normalizeDishRatings(review).map((dishRating) => ({
      dishId: String(dishRating.dish_id),
      rating: dishRating.rating,
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
>>>>>>> develop2

// ========================
// CREATE
// ========================
const createReview = async (data: Partial<IReview>): Promise<IReview> => {
    const review = new ReviewModel({...data, customer_id: new mongoose.Types.ObjectId(data.customer_id),
        restaurant_id: new mongoose.Types.ObjectId(data.restaurant_id)
    });
    return await review.save();
};

// ========================
// GET ONE
// ========================
const getReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return await ReviewModel.findOne({ _id: reviewId, deleted: false }).populate('customer_id', 'name profilePictures')
        .populate('restaurant_id', 'name').lean();
};

const getDeletedReview = async (review_id: string): Promise<IReview | null> => {
  if (!mongoose.Types.ObjectId.isValid(review_id)) return null;

  return ReviewModel.findOne({ _id: review_id, ...INCTIVE_REVIEW_FILTER })
    .populate('customer_id', 'name profilePictures')
    .populate('restaurant_id', 'name')
    .lean();
};

// ========================
// GET ALL
// ========================
const getAllReviews = async (): Promise<IReview[]> => {
    return await ReviewModel.find({ deleted: false }).populate('customer_id', 'name')
        .populate('restaurant_id', 'name')
        .lean();
};

const getAllDeletedReviews = async (): Promise<IReview[]> => {
  return ReviewModel.find({ ...INCTIVE_REVIEW_FILTER })
    .populate('customer_id', 'name')
    .populate('restaurant_id', 'name')
    .lean();
};

// ========================
// UPDATE
// ========================
const updateReview = async ( reviewId: string, data: Partial<IReview> ):
    Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    delete data._id;
    delete data.customer_id;
    delete data.restaurant_id;
    return await ReviewModel.findOneAndUpdate( { _id: reviewId, deleted: false },
        data, { new: true, runValidators: true } ).lean();
};

// ========================
// DELETE (SOFT)
// ========================
<<<<<<< dishRating
const deleteReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return await ReviewModel.findOneAndUpdate( { _id: reviewId, deleted: false },
        { deleted: true }, { new: true } ).lean();
=======
const softDeleteReview = async (review_id: string): Promise<IReview | null> => {
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
>>>>>>> develop2
};

const restoreReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;

    const deleted = await ReviewModel.findOneAndUpdate(
    { _id: review_id, ...INCTIVE_REVIEW_FILTER },
    { deletedAt: null, deleted: false },
    { new: true }
  ).lean();

  if (deleted) {
    await recalculateDishRatingsByRestaurant(
      new mongoose.Types.ObjectId(deleted.restaurant_id)
    );
  }

  return deleted;
};

const hardDeleteReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;
    
    const deleted = await ReviewModel.findOneAndDelete({ _id: review_id }).lean();

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
const getReviewsByRestaurant = async (restaurantId: string): Promise<IReview[]> => {
    return await ReviewModel.find({
        restaurant_id: new mongoose.Types.ObjectId(restaurantId), // 🔥 FIX
        deleted: false
    })
        .populate('customer_id', 'name profilePictures')
        .lean();
};

const getDeletedReviewsByRestaurant = async (restaurant_id: string): Promise<IReview[]> => {
  return ReviewModel.find({
    restaurant_id: new mongoose.Types.ObjectId(restaurant_id),
    ...INCTIVE_REVIEW_FILTER
  })
    .populate('customer_id', 'name profilePictures')
    .lean();
};

// ========================
// BY CUSTOMER 🔥 FIXED
// ========================
const getReviewsByCustomer = async (
<<<<<<< dishRating
    customerId: string,
    limit = 5,
    skip = 0,
    minglobalRating?: number,
    sortByLikes?: boolean
) => {

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return { data: [], total: 0 };
    }
=======
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

const getDeletedReviewsByCustomer = async (
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
    ...INCTIVE_REVIEW_FILTER
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
>>>>>>> develop2

    const filter: any = {
        customer_id: new mongoose.Types.ObjectId(customerId), // 🔥 FIX CLAVE
        deleted: false
    };

    if (minglobalRating !== undefined) {
        filter.globalRating = { $gte: minglobalRating };
    }

    const sort: any = sortByLikes ? { likes: -1 } : { date: -1 };

    const [reviews, total] = await Promise.all([
        ReviewModel.find(filter).sort(sort).skip(skip).limit(limit)
            .populate({
                path: 'restaurant_id',
                select: 'profile'
            }).lean(),
        ReviewModel.countDocuments(filter)
    ]);

    return {
        data: reviews.map((r: any) => ({
            ...r,
            restaurant_id: {
                _id: r.restaurant_id._id,
                name: r.restaurant_id.profile?.name
            }
        })),
        total
    };
};

// ========================
// LIKE
// ========================
const likeReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;

    return await ReviewModel.findOneAndUpdate(
        { _id: reviewId, deleted: false },
        { $inc: { likes: 1 } },
        { new: true }
    ).lean();
};

export default {
<<<<<<< dishRating
    createReview,
    getReview,
    getAllReviews,
    updateReview,
    deleteReview,
    getReviewsByRestaurant,
    getReviewsByCustomer,
    likeReview
};
=======
  createReview,
  getReview,
  getDeletedReview,
  getAllReviews,
  getAllDeletedReviews,
  updateReview,
  softDeleteReview,
  restoreReview,
  hardDeleteReview,
  getReviewsByRestaurant,
  getDeletedReviewsByRestaurant,
  getReviewsByCustomer,
  getDeletedReviewsByCustomer,
  likeReview,
  getRestaurantTopDish,
  getRestaurantDishesWithRatings
};
>>>>>>> develop2
