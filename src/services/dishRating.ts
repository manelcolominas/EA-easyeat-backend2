import mongoose, { PipelineStage } from 'mongoose';
import { DishRatingModel, IDishRating } from '../models/dishRating';
import { DishModel } from '../models/dish';
import { CustomerModel } from '../models/customer';
import { PointsWalletModel } from '../models/pointsWallet';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RateSummary {
    avgRating: number;
}

export interface RateResult {
    data:  IDishRating;
    isNew: boolean;
}

// ─── Create or Update ─────────────────────────────────────────────────────────

/**
 * Creates a new dish rating or updates the customer's existing active rating.
 * Returns null when the dish is not found or is inactive.
 */
const rateOrUpdateDish = async ( customer_id: string, dish_id: string, rating: number ): Promise<RateResult | null> => {
    if (
        !mongoose.Types.ObjectId.isValid(customer_id) ||
        !mongoose.Types.ObjectId.isValid(dish_id)
    )
    {
        return null;
    }
    // Validate dish exists and is active
    const dish = await DishModel.findOne({ _id: dish_id, active: true });
    if (!dish) return null;

    const restaurant_id = dish.restaurant_id;
    const customerId        = new mongoose.Types.ObjectId(customer_id);
    const dishId        = new mongoose.Types.ObjectId(dish_id);

    // Check for an existing active rating to decide create vs update
    const existing = await DishRatingModel.findOne({ customer_id: customerId, dish_id: dishId, deletedAt:  null });

    if (existing) {
        existing.rating = rating;
        const updated = await existing.save();
        return { data: updated, isNew: false };
    }

    const dishRating = new DishRatingModel({
        _id: new mongoose.Types.ObjectId(),
        customer_id:   customerId,
        dish_id:       dishId,
        restaurant_id,
        rating,
        deletedAt: null,
    });

    const created = await dishRating.save();
    return { data: created, isNew: true };
};

// ─── Read ratings for a dish ─────────────────────────────────────────────────

const getRatingsByDish = async (dish_id: string): Promise<any[]> => {
    if (!mongoose.Types.ObjectId.isValid(dish_id)) {
        return [];
    }

    const dishRatings = await DishRatingModel.find({ dish_id: dish_id });
    return dishRatings;
};

// ─── Read ratings for a customer ─────────────────────────────────────────────

const getRatingsByCustomer = async ( customer_id: string ): Promise<any[]> => {
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return [];
    }

    const filter = { customer_id: new mongoose.Types.ObjectId(customer_id), deletedAt: null };

    return DishRatingModel.find(filter)
        .sort({ createdAt: -1 })
        .populate('dish_id', 'name section price')
        .lean();
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

/**
 * Soft-deletes a rating by setting deletedAt.
 * When customer_id is provided, only that customer's rating can be deleted
 * (used to enforce ownership; admins omit customer_id to bypass).
 */
const softDeleteRating = async ( rating_id: string, customer_id?: string ): Promise<IDishRating | null> => {
    if (!mongoose.Types.ObjectId.isValid(rating_id)) return null;

    const filter: Record<string, unknown> = { _id: rating_id, deletedAt: null };
    if (customer_id) filter.customer_id = new mongoose.Types.ObjectId(customer_id);

    return DishRatingModel.findOneAndUpdate(
        filter,
        { deletedAt: new Date() },
        { new: true }
    ).lean();
};

// ─── Rating summary (aggregation) ────────────────────────────────────────────

const getDishRatingSummary = async (dish_id: string): Promise<RateSummary> => {
    if (!mongoose.Types.ObjectId.isValid(dish_id)) {
        return { avgRating: 0 };
    }

    const pipeline: PipelineStage[] = [
        { $match: { dish_id: new mongoose.Types.ObjectId(dish_id), deletedAt: null } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
            },
        },
    ];

    const [result] = await DishRatingModel.aggregate(pipeline);

    if (!result) {
        return { avgRating: 0 };
    }

    return {
        avgRating: Math.round(result.avgRating * 10) / 10,
    };
};

const getTopDishByRestaurant = async (restaurant_id: string) => {
    if (!mongoose.Types.ObjectId.isValid(restaurant_id)) return null;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                restaurant_id: new mongoose.Types.ObjectId(restaurant_id),
                deletedAt: null
            }
        },
        {
            $group: {
                _id: "$dish_id",
                averageRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 }
            }
        },
        {
            $sort: { averageRating: -1 }
        },
        {
            $limit: 1
        }
    ];

    const [topDish] = await DishRatingModel.aggregate(pipeline);

    if (!topDish) return null;

    const dish = await DishModel.findOne({ _id: topDish._id, active: true });

    if (!dish) return null;

    return {
        name: dish.name,
        averageRating: Math.round(topDish.averageRating * 10) / 10,
        totalRatings: topDish.totalRatings
    };
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export default {
    rateOrUpdateDish,
    getRatingsByDish,
    getRatingsByCustomer,
    softDeleteRating,
    getDishRatingSummary,
    getTopDishByRestaurant
};
