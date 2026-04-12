import mongoose from 'mongoose';
import { ReviewModel, IReview } from '../models/review';
import { DishModel } from '../models/dish';

type AggregatedDishRating = {
    _id: mongoose.Types.ObjectId;
    avgRating: number;
    ratingsCount: number;
};

const normalizeDishRatings = (dishRatings: IReview['dishRatings']) => {
    if (!dishRatings) return undefined;

    return dishRatings.map((dishRating) => ({
        dish_id: new mongoose.Types.ObjectId(dishRating.dish_id),
        rating: dishRating.rating,
    }));
};

const recalculateDishRatingsByRestaurant = async (restaurantId: mongoose.Types.ObjectId): Promise<void> => {
    const aggregated = await ReviewModel.aggregate<AggregatedDishRating>([
        {
            $match: {
                restaurant_id: restaurantId,
                deleted: false,
                dishRatings: { $exists: true, $ne: [] },
            },
        },
        { $unwind: '$dishRatings' },
        {
            $group: {
                _id: '$dishRatings.dish_id',
                avgRating: { $avg: '$dishRatings.rating' },
                ratingsCount: { $sum: 1 },
            },
        },
    ]);

    await DishModel.updateMany(
        { restaurant_id: restaurantId },
        { $set: { userRatingAvg: 0, userRatingCount: 0 } }
    );

    if (!aggregated.length) return;

    await DishModel.bulkWrite(
        aggregated.map((dish) => ({
            updateOne: {
                filter: { _id: dish._id, restaurant_id: restaurantId },
                update: {
                    $set: {
                        userRatingAvg: Number(dish.avgRating.toFixed(2)),
                        userRatingCount: dish.ratingsCount,
                    },
                },
            },
        }))
    );
};

// ========================
// CREATE
// ========================
const createReview = async (data: Partial<IReview>): Promise<IReview> => {
    const restaurantId = new mongoose.Types.ObjectId(data.restaurant_id);
    const review = new ReviewModel({
        ...data,
        customer_id: new mongoose.Types.ObjectId(data.customer_id),
        restaurant_id: restaurantId,
        dishRatings: normalizeDishRatings(data.dishRatings),
    });

    const savedReview = await review.save();
    await recalculateDishRatingsByRestaurant(restaurantId);
    return savedReview;
};

// ========================
// GET ONE
// ========================
const getReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    return await ReviewModel.findOne({ _id: reviewId, deleted: false }).populate('customer_id', 'name profilePictures')
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

// ========================
// UPDATE
// ========================
const updateReview = async ( reviewId: string, data: Partial<IReview> ):
    Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    delete data._id;
    delete data.customer_id;
    delete data.restaurant_id;

    const updatePayload: Partial<IReview> = { ...data };
    if (data.dishRatings !== undefined) {
        updatePayload.dishRatings = normalizeDishRatings(data.dishRatings);
    }

    const updatedReview = await ReviewModel.findOneAndUpdate(
        { _id: reviewId, deleted: false },
        updatePayload,
        { new: true, runValidators: true }
    ).lean();

    if (updatedReview && data.dishRatings !== undefined) {
        await recalculateDishRatingsByRestaurant(new mongoose.Types.ObjectId(updatedReview.restaurant_id));
    }

    return updatedReview;
};

// ========================
// DELETE (SOFT)
// ========================
const deleteReview = async (reviewId: string): Promise<IReview | null> => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return null;
    const deletedReview = await ReviewModel.findOneAndUpdate(
        { _id: reviewId, deleted: false },
        { deleted: true },
        { new: true }
    ).lean();

    if (deletedReview) {
        await recalculateDishRatingsByRestaurant(new mongoose.Types.ObjectId(deletedReview.restaurant_id));
    }

    return deletedReview;
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

// ========================
// BY CUSTOMER 🔥 FIXED
// ========================
const getReviewsByCustomer = async (
    customerId: string,
    limit = 5,
    skip = 0,
    minglobalRating?: number,
    sortByLikes?: boolean
) => {

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return { data: [], total: 0 };
    }

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
    getAllReviews,
    updateReview,
    deleteReview,
    getReviewsByRestaurant,
    getReviewsByCustomer,
    likeReview
};