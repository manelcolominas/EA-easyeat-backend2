import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/review';

// ========================
// CREATE
// ========================
const createReview = async (data: Partial<IReview>): Promise<IReview> => {
    const review = new ReviewModel({
        ...data, customer_id: new mongoose.Types.ObjectId(data.customer_id),
        restaurant_id: new mongoose.Types.ObjectId(data.restaurant_id)
    });
    return await review.save();
};

// ========================
// GET ONE
// ========================
const getReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;
    return await ReviewModel.findOne({ _id: review_id, deleted: false }).populate('customer_id', 'name profilePictures')
        .populate('restaurant_id', 'name').lean();
};

const getDeletedReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;
    return await ReviewModel.findOne({ _id: review_id, deleted: true }).populate('customer_id', 'name profilePictures')
        .populate('restaurant_id', 'name').lean();
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
    return await ReviewModel.find({ deleted: true }).populate('customer_id', 'name')
        .populate('restaurant_id', 'name')
        .lean();
};

// ========================
// UPDATE
// ========================
const updateReview = async (review_id: string, data: Partial<IReview>):
    Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;
    delete data._id;
    delete data.customer_id;
    delete data.restaurant_id;
    return await ReviewModel.findOneAndUpdate({ _id: review_id, deleted: false },
        data, { new: true, runValidators: true }).lean();
};

// ========================
// DELETE (SOFT)
// ========================
const softDeleteReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;
    return await ReviewModel.findOneAndUpdate({ _id: review_id, deleted: false },
        { deleted: true }, { new: true }).lean();
};

const restoreReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;
    return await ReviewModel.findOneAndUpdate({ _id: review_id, deleted: true },
        { deleted: false }, { new: true }).lean();
};

const hardDeleteReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;
    return await ReviewModel.findOneAndDelete({ _id: review_id }).lean();
};

// ========================
// BY RESTAURANT
// ========================
const getReviewsByRestaurant = async (restaurant_id: string): Promise<IReview[]> => {
    return await ReviewModel.find({
        restaurant_id: new mongoose.Types.ObjectId(restaurant_id), // 🔥 FIX
        deleted: false
    })
        .populate('customer_id', 'name profilePictures')
        .lean();
};

const getDeletedReviewsByRestaurant = async (restaurant_id: string): Promise<IReview[]> => {
    return await ReviewModel.find({
        restaurant_id: new mongoose.Types.ObjectId(restaurant_id),
        deleted: true
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
    minglobalRating?: number,
    sortByLikes?: boolean
) => {

    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return { data: [], total: 0 };
    }

    const filter: any = {
        customer_id: new mongoose.Types.ObjectId(customer_id), // 🔥 FIX CLAVE
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

const getDeletedReviewsByCustomer = async (
    customer_id: string,
    limit = 5,
    skip = 0,
    minglobalRating?: number,
    sortByLikes?: boolean
) => {

    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return { data: [], total: 0 };
    }

    const filter: any = {
        customer_id: new mongoose.Types.ObjectId(customer_id),
        deleted: true
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
const likeReview = async (review_id: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(review_id)) return null;

    return await ReviewModel.findOneAndUpdate(
        { _id: review_id, deleted: false },
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
    likeReview
};
