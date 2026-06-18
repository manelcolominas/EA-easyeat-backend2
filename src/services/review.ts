import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/review';
import NotificationService from '../services/notification';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewListOptions {
  minGlobalRating?: number;
  sortByLikes?: boolean;
}

// ─── Filter Constants ─────────────────────────────────────────────────────────

const ACTIVE_REVIEW_FILTER = { deleted: false } as const;
const DELETED_REVIEW_FILTER = { deleted: true } as const;

// ─── CRUD ─────────────────────────────────────────────────────────────────────

const createReview = async (data: Partial<IReview>): Promise<IReview> => {
  const review = new ReviewModel({
    ...data,
    customer_id: new mongoose.Types.ObjectId(data.customer_id),
    restaurant_id: new mongoose.Types.ObjectId(data.restaurant_id)
  });
  return review.save();
};

const getReview = async (reviewId: string): Promise<IReview> => {
  return ReviewModel.findOne({ _id: reviewId, ...ACTIVE_REVIEW_FILTER })
    .populate('customer_id', 'name profilePictures')
    .populate('restaurant_id', 'name')
    .lean();
};

const getDeletedReview = async (reviewId: string): Promise<IReview> => {
  return ReviewModel.findOne({ _id: reviewId, ...DELETED_REVIEW_FILTER })
    .populate('customer_id', 'name profilePictures')
    .populate('restaurant_id', 'name')
    .lean();
};

const getAllReviews = async (skip: number, limit: number): Promise<{ reviews: IReview[]; total: number }> => {
  const [reviews, total] = await Promise.all([
    ReviewModel.find(ACTIVE_REVIEW_FILTER).populate('customer_id', 'name').populate('restaurant_id', 'name').skip(skip).limit(limit).lean(),
    ReviewModel.countDocuments(ACTIVE_REVIEW_FILTER)
  ]);
  return { reviews, total };
};

const getAllDeletedReviews = async (skip: number, limit: number): Promise<{ reviews: IReview[]; total: number }> => {
  const [reviews, total] = await Promise.all([
    ReviewModel.find(DELETED_REVIEW_FILTER).populate('customer_id', 'name').populate('restaurant_id', 'name').skip(skip).limit(limit).lean(),
    ReviewModel.countDocuments(DELETED_REVIEW_FILTER)
  ]);
  return { reviews, total };
};

const updateReview = async (reviewId: string, data: Partial<IReview>): Promise<IReview> => {
  const { _id, customer_id, restaurant_id, likes, likedBy, ...safeData } = data;
  return ReviewModel.findOneAndUpdate({ _id: reviewId, ...ACTIVE_REVIEW_FILTER }, safeData, { new: true, runValidators: true }).lean();
};

// ─── Delete / Restore ─────────────────────────────────────────────────────────

const softDeleteReview = async (reviewId: string): Promise<IReview> => {
  return ReviewModel.findOneAndUpdate({ _id: reviewId, ...ACTIVE_REVIEW_FILTER }, { deleted: true }, { new: true }).lean();
};

const restoreReview = async (reviewId: string): Promise<IReview> => {
  return ReviewModel.findOneAndUpdate({ _id: reviewId, ...DELETED_REVIEW_FILTER }, { deleted: false }, { new: true }).lean();
};

const hardDeleteReview = async (reviewId: string): Promise<IReview> => {
  return ReviewModel.findByIdAndDelete(reviewId).lean();
};

// ─── Queries by relation ──────────────────────────────────────────────────────

const getReviewsByRestaurant = async (restaurantId: string, skip: number, limit: number): Promise<{ reviews: IReview[]; total: number }> => {
  const filter = {
    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
    ...ACTIVE_REVIEW_FILTER
  };
  const [reviews, total] = await Promise.all([ReviewModel.find(filter).populate('customer_id', 'name profilePictures').skip(skip).limit(limit).lean(), ReviewModel.countDocuments(filter)]);
  return { reviews, total };
};

const getDeletedReviewsByRestaurant = async (restaurantId: string, skip: number, limit: number): Promise<{ reviews: IReview[]; total: number }> => {
  const filter = { restaurant_id: new mongoose.Types.ObjectId(restaurantId), ...DELETED_REVIEW_FILTER };
  const [reviews, total] = await Promise.all([ReviewModel.find(filter).populate('customer_id', 'name profilePictures').skip(skip).limit(limit).lean(), ReviewModel.countDocuments(filter)]);
  return { reviews, total };
};

// ─── Paginated queries by customer ───────────────────────────────────────────

const getReviewsByCustomer = async (customerId: string, skip: number, limit: number, options: ReviewListOptions = {}): Promise<{ reviews: IReview[]; total: number }> => {
  const filter: Record<string, any> = {
    customer_id: new mongoose.Types.ObjectId(customerId),
    ...ACTIVE_REVIEW_FILTER
  };

  if (options.minGlobalRating !== undefined) {
    filter.globalRating = { $gte: options.minGlobalRating };
  }

  const sort: Record<string, 1 | -1> = options.sortByLikes ? { likes: -1 } : { createdAt: -1 };

  const [reviews, total] = await Promise.all([
    ReviewModel.find(filter).sort(sort).skip(skip).limit(limit).populate({ path: 'restaurant_id', select: 'profile.name' }).lean<IReview[]>(),
    ReviewModel.countDocuments(filter)
  ]);

  return { reviews, total };
};

const getDeletedReviewsByCustomer = async (customerId: string, skip: number, limit: number, options: ReviewListOptions = {}): Promise<{ reviews: IReview[]; total: number }> => {
  const filter: Record<string, any> = {
    customer_id: new mongoose.Types.ObjectId(customerId),
    ...DELETED_REVIEW_FILTER
  };
  if (options.minGlobalRating !== undefined) {
    filter.globalRating = { $gte: options.minGlobalRating };
  }

  const sort: Record<string, 1 | -1> = options.sortByLikes ? { likes: -1 } : { createdAt: -1 };

  const [reviews, total] = await Promise.all([
    ReviewModel.find(filter).sort(sort).skip(skip).limit(limit).populate({ path: 'restaurant_id', select: 'profile.name' }).lean<IReview[]>(),
    ReviewModel.countDocuments(filter)
  ]);

  return { reviews, total };
};

// ─── Like ─────────────────────────────────────────────────────────────────────

const likeReview = async (reviewId: string, userId: string): Promise<IReview> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Check if user has already liked this review
  const exists = await ReviewModel.findOne({
    _id: reviewId,
    likedBy: userObjectId,
    ...ACTIVE_REVIEW_FILTER
  });

  if (exists) {
    throw new Error('You have already liked this review');
  }

  // Increment likes and add user to likedBy array
  const updated = await ReviewModel.findOneAndUpdate(
    { _id: reviewId, ...ACTIVE_REVIEW_FILTER },
    {
      $inc: { likes: 1 },
      $addToSet: { likedBy: userObjectId }
    },
    { new: true }
  ).lean();

  // If update succeeded, send a notification (best-effort)
  if (updated) {
    try {
      await NotificationService.createAndSendNotification({
        // Cast ids to any so typing differences (ObjectId vs string) don't fail here
        customer_id: updated.customer_id as any,
        restaurant_id: updated.restaurant_id as any,
        type: 'review_liked',
        title: 'La teva review ha rebut un like',
        message: 'Algú ha valorat positivament la teva opinió.',
        data: {
          review_id: updated._id as any
        }
      });
    } catch (err) {
      // swallow notification errors to avoid breaking the like API
      console.warn('Failed to send review liked notification', (err as any)?.message || err);
    }
  }

  return updated as any;
};

// ─── Exports ──────────────────────────────────────────────────────────────────

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
  likeReview
};
