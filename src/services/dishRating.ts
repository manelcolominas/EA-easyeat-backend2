import mongoose, { PipelineStage } from 'mongoose';
import { DishRatingModel, IDishRating } from '../models/dishRating';
import { DishModel } from '../models/dish';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationOptions {
    page?:  number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data:       T[];
    total:      number;
    page:       number;
    totalPages: number;
}

export interface RateSummary {
    count:        number;
    average:      number;
    distribution: { rating: number; count: number }[];
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
const rateOrUpdateDish = async (
    customer_id: string,
    dish_id:     string,
    rating:      number,
    comment?:    string
): Promise<RateResult | null> => {
    if (
        !mongoose.Types.ObjectId.isValid(customer_id) ||
        !mongoose.Types.ObjectId.isValid(dish_id)
    ) {
        return null;
    }

    // Validate dish exists and is active
    const dish = await DishModel.findOne({ _id: dish_id, active: true });
    if (!dish) return null;

    const restaurant_id = dish.restaurant_id;
    const custId        = new mongoose.Types.ObjectId(customer_id);
    const dishId        = new mongoose.Types.ObjectId(dish_id);

    // Check for an existing active rating to decide create vs update
    const existing = await DishRatingModel.findOne({
        customer_id: custId,
        dish_id:     dishId,
        deletedAt:   null,
    });

    if (existing) {
        existing.rating = rating;
        if (comment !== undefined) existing.comment = comment;
        const updated = await existing.save();
        return { data: updated, isNew: false };
    }

    const dishRating = new DishRatingModel({
        _id: new mongoose.Types.ObjectId(),
        customer_id:   custId,
        dish_id:       dishId,
        restaurant_id,
        rating,
        comment,
        deletedAt: null,
    });

    const created = await dishRating.save();
    return { data: created, isNew: true };
};

// ─── Read ratings for a dish (paginated) ─────────────────────────────────────

const getRatingsByDish = async (
    dish_id:   string,
    { page = 1, limit = 20 }: PaginationOptions = {}
): Promise<PaginatedResult<IDishRating>> => {
    if (!mongoose.Types.ObjectId.isValid(dish_id)) {
        return { data: [], total: 0, page, totalPages: 0 };
    }

    const skip   = (page - 1) * limit;
    const filter = { dish_id: new mongoose.Types.ObjectId(dish_id), deletedAt: null };

    const [data, total] = await Promise.all([
        DishRatingModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('customer_id', 'name profilePictures')
            .lean(),
        DishRatingModel.countDocuments(filter),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Read ratings for a customer (paginated) ─────────────────────────────────

const getRatingsByCustomer = async (
    customer_id: string,
    { page = 1, limit = 20 }: PaginationOptions = {}
): Promise<PaginatedResult<IDishRating>> => {
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return { data: [], total: 0, page, totalPages: 0 };
    }

    const skip   = (page - 1) * limit;
    const filter = { customer_id: new mongoose.Types.ObjectId(customer_id), deletedAt: null };

    const [data, total] = await Promise.all([
        DishRatingModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('dish_id', 'name section price images')
            .lean(),
        DishRatingModel.countDocuments(filter),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

/**
 * Soft-deletes a rating by setting deletedAt.
 * When customer_id is provided, only that customer's rating can be deleted
 * (used to enforce ownership; admins omit customer_id to bypass).
 */
const softDeleteRating = async (
    rating_id:   string,
    customer_id?: string
): Promise<IDishRating | null> => {
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

/**
 * Returns count, rounded average, and integer-bucket distribution for a dish.
 * Suitable for display and future caching/analytics.
 */
const getDishRatingSummary = async (dish_id: string): Promise<RateSummary> => {
    if (!mongoose.Types.ObjectId.isValid(dish_id)) {
        return { count: 0, average: 0, distribution: [] };
    }

    const pipeline: PipelineStage[] = [
        { $match: { dish_id: new mongoose.Types.ObjectId(dish_id), deletedAt: null } },
        {
            $facet: {
                stats: [
                    {
                        $group: {
                            _id:     null,
                            count:   { $sum: 1 },
                            average: { $avg: '$rating' },
                        },
                    },
                ],
                distribution: [
                    { $group: { _id: { $floor: '$rating' }, count: { $sum: 1 } } },
                    { $sort:  { _id: 1 } },
                ],
            },
        },
    ];

    const [result] = await DishRatingModel.aggregate(pipeline);

    if (!result?.stats?.[0]) {
        return { count: 0, average: 0, distribution: [] };
    }

    return {
        count:   result.stats[0].count,
        average: Math.round(result.stats[0].average * 10) / 10,
        distribution: (result.distribution as { _id: number; count: number }[]).map(d => ({
            rating: d._id,
            count:  d.count,
        })),
    };
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export default {
    rateOrUpdateDish,
    getRatingsByDish,
    getRatingsByCustomer,
    softDeleteRating,
    getDishRatingSummary,
};
