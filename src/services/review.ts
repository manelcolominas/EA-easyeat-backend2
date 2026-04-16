import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/review';

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
};