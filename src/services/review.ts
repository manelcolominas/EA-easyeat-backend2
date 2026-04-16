import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/review';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ICustomerReviewListResponse {
    data: IReview[];
    total: number;
}

export interface ReviewListOptions {
    limit?: number;
    skip?: number;
    minGlobalRating?: number;
    sortByLikes?: boolean;
}

// ─── Filter Constants ─────────────────────────────────────────────────────────

const ACTIVE_REVIEW_FILTER  = { deleted: false } as const;
const DELETED_REVIEW_FILTER = { deleted: true  } as const;

// ─── CRUD ─────────────────────────────────────────────────────────────────────

const createReview = async (data: Partial<IReview>): Promise<IReview> => {
    const review = new ReviewModel({
        ...data,
        customer_id:   new mongoose.Types.ObjectId(data.customer_id),
        restaurant_id: new mongoose.Types.ObjectId(data.restaurant_id),
    });
    return review.save();
};

const getReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return ReviewModel
        .findOne({ _id: reviewId, ...ACTIVE_REVIEW_FILTER })
        .populate('customer_id', 'name profilePictures')
        .populate('restaurant_id', 'name')
        .lean();
};

const getDeletedReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return ReviewModel
        .findOne({ _id: reviewId, ...DELETED_REVIEW_FILTER })
        .populate('customer_id', 'name profilePictures')
        .populate('restaurant_id', 'name')
        .lean();
};

const getAllReviews = async (): Promise<IReview[]> => {
    return ReviewModel
        .find(ACTIVE_REVIEW_FILTER)
        .populate('customer_id', 'name')
        .populate('restaurant_id', 'name')
        .lean();
};

const getAllDeletedReviews = async (): Promise<IReview[]> => {
    return ReviewModel
        .find(DELETED_REVIEW_FILTER)
        .populate('customer_id', 'name')
        .populate('restaurant_id', 'name')
        .lean();
};

const updateReview = async (reviewId: string, data: Partial<IReview>): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    const { _id, customer_id, restaurant_id, ...safeData } = data;
    return ReviewModel
        .findOneAndUpdate(
            { _id: reviewId, ...ACTIVE_REVIEW_FILTER },
            safeData,
            { new: true, runValidators: true },
        )
        .lean();
};

// ─── Delete / Restore ─────────────────────────────────────────────────────────

const softDeleteReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return ReviewModel
        .findOneAndUpdate(
            { _id: reviewId, ...ACTIVE_REVIEW_FILTER },
            { deleted: true },
            { new: true },
        )
        .lean();
};

const restoreReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return ReviewModel
        .findOneAndUpdate(
            { _id: reviewId, ...DELETED_REVIEW_FILTER },
            { deleted: false },
            { new: true },
        )
        .lean();
};

const hardDeleteReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return ReviewModel.findByIdAndDelete(reviewId).lean();
};

// ─── Queries by relation ──────────────────────────────────────────────────────

const getReviewsByRestaurant = async (restaurantId: string): Promise<IReview[]> => {
    return ReviewModel
        .find({
            restaurant_id: new mongoose.Types.ObjectId(restaurantId),
            ...ACTIVE_REVIEW_FILTER,
        })
        .populate('customer_id', 'name profilePictures')
        .lean();
};

const getDeletedReviewsByRestaurant = async (restaurantId: string): Promise<IReview[]> => {
    return ReviewModel
        .find({
            restaurant_id: new mongoose.Types.ObjectId(restaurantId),
            ...DELETED_REVIEW_FILTER,
        })
        .populate('customer_id', 'name profilePictures')
        .lean();
};

// ─── Paginated queries by customer ───────────────────────────────────────────

const buildCustomerFilter = (
    customerId: string,
    deletedFilter: Record<string, boolean>,
    minGlobalRating?: number,
): Record<string, unknown> => {
    const filter: Record<string, unknown> = {
        customer_id: new mongoose.Types.ObjectId(customerId),
        ...deletedFilter,
    };
    if (minGlobalRating !== undefined) {
        filter.globalRating = { $gte: minGlobalRating };
    }
    return filter;
};

const fetchCustomerReviews = async (
    filter: Record<string, unknown>,
    options: ReviewListOptions,
): Promise<ICustomerReviewListResponse> => {
    const { limit = 5, skip = 0, sortByLikes = false } = options;
    const sort: Record<string, 1 | -1> = sortByLikes ? { likes: -1 } : { createdAt: -1 };

    const [reviews, total] = await Promise.all([
        ReviewModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({ path: 'restaurant_id', select: 'profile' })
            .lean(),
        ReviewModel.countDocuments(filter),
    ]);

    return {
        data: reviews.map((review: any) => ({
            ...review,
            restaurant_id: {
                _id:  review.restaurant_id._id,
                name: review.restaurant_id.profile?.name,
            },
        })),
        total,
    };
};

const getReviewsByCustomer = async (
    customerId: string,
    options: ReviewListOptions = {},
): Promise<ICustomerReviewListResponse> => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) return { data: [], total: 0 };
    const filter = buildCustomerFilter(customerId, ACTIVE_REVIEW_FILTER, options.minGlobalRating);
    return fetchCustomerReviews(filter, options);
};

const getDeletedReviewsByCustomer = async (
    customerId: string,
    options: ReviewListOptions = {},
): Promise<ICustomerReviewListResponse> => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) return { data: [], total: 0 };
    const filter = buildCustomerFilter(customerId, DELETED_REVIEW_FILTER, options.minGlobalRating);
    return fetchCustomerReviews(filter, options);
};

// ─── Like ─────────────────────────────────────────────────────────────────────

const likeReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return ReviewModel
        .findOneAndUpdate(
            { _id: reviewId, ...ACTIVE_REVIEW_FILTER },
            { $inc: { likes: 1 } },
            { new: true },
        )
        .lean();
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
    likeReview,
};