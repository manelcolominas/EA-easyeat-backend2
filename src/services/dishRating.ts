import mongoose from 'mongoose';
import { CustomerModel } from '../models/customer';
import { DishModel } from '../models/dish';
import { RestaurantModel } from '../models/restaurant';
import { DishRatingModel, IDishRating } from '../models/dishRating';
import { ReviewModel } from '../models/review';

export interface IDishRatingSummary {
    dishId: string;
    name: string;
    averageRating: number;
    totalRatings: number;
    images?: string[];
}

export interface IRestaurantTopDishResponse {
    restaurantId: string;
    restaurantName: string;
    topDish: IDishRatingSummary | null;
}

export class DishRatingServiceError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'DishRatingServiceError';
    }
}

const toObjectId = (value: string, fieldName: string): mongoose.Types.ObjectId => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new DishRatingServiceError(400, `${fieldName} is invalid`);
    }

    return new mongoose.Types.ObjectId(value);
};

const syncDishRatingStats = async (restaurantId: mongoose.Types.ObjectId, dishId: mongoose.Types.ObjectId): Promise<void> => {
    const stats = await DishRatingModel.aggregate<{ _id: mongoose.Types.ObjectId; averageRating: number; totalRatings: number }>([
        {
            $match: {
                restaurant_id: restaurantId,
                dish_id: dishId,
            },
        },
        {
            $group: {
                _id: '$dish_id',
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 },
            },
        },
    ]);

    const averageRating = stats[0]?.averageRating ?? 0;
    const totalRatings = stats[0]?.totalRatings ?? 0;

    await DishModel.findByIdAndUpdate(dishId, {
        userRatingAvg: Number(averageRating.toFixed(2)),
        userRatingCount: totalRatings,
    });
};

const createDishRating = async (data: Partial<IDishRating>): Promise<IDishRating> => {
    const customerIdValue = data.customer_id ?? (data as { customerId?: string | mongoose.Types.ObjectId }).customerId;
    const restaurantIdValue = data.restaurant_id ?? (data as { restaurantId?: string | mongoose.Types.ObjectId }).restaurantId;
    const dishIdValue = data.dish_id ?? (data as { dishId?: string | mongoose.Types.ObjectId }).dishId;

    if (!customerIdValue || !restaurantIdValue || !dishIdValue) {
        throw new DishRatingServiceError(400, 'customer_id, restaurant_id and dish_id are required');
    }

    const customerId = toObjectId(String(customerIdValue), 'customer_id');
    const restaurantId = toObjectId(String(restaurantIdValue), 'restaurant_id');
    const dishId = toObjectId(String(dishIdValue), 'dish_id');

    if (typeof data.rating !== 'number' || Number.isNaN(data.rating)) {
        throw new DishRatingServiceError(400, 'rating is required');
    }

    const [customer, restaurant, dish] = await Promise.all([
        CustomerModel.findById(customerId).active().select('_id').lean(),
        RestaurantModel.findById(restaurantId).active().select('_id profile.name').lean(),
        DishModel.findOne({ _id: dishId, restaurant_id: restaurantId, active: true }).select('_id restaurant_id').lean(),
    ]);

    if (!customer) {
        throw new DishRatingServiceError(404, 'Customer not found');
    }

    if (!restaurant) {
        throw new DishRatingServiceError(404, 'Restaurant not found');
    }

    if (!dish) {
        throw new DishRatingServiceError(404, 'Dish not found for this restaurant');
    }

    const totalRatingsByCustomer = await DishRatingModel.countDocuments({ customer_id: customerId });

    if (totalRatingsByCustomer >= 3) {
        throw new DishRatingServiceError(409, 'Each customer can rate up to 3 dishes');
    }

    const existingRating = await DishRatingModel.findOne({ customer_id: customerId, dish_id: dishId }).lean();

    if (existingRating) {
        throw new DishRatingServiceError(409, 'This customer has already rated this dish');
    }

    const rating = new DishRatingModel({
        customer_id: customerId,
        restaurant_id: restaurantId,
        dish_id: dishId,
        rating: data.rating,
    });

    const savedRating = await rating.save();

    await syncDishRatingStats(restaurantId, dishId);

    return savedRating;
};

const getRestaurantTopDish = async (restaurantId: string): Promise<IRestaurantTopDishResponse> => {
    const restaurantObjectId = toObjectId(restaurantId, 'restaurantId');
    const restaurant = await RestaurantModel.findById(restaurantObjectId).active().select('profile.name').lean();

    if (!restaurant) {
        throw new DishRatingServiceError(404, 'Restaurant not found');
    }

    const aggregated = await ReviewModel.aggregate<{
        _id: mongoose.Types.ObjectId;
        averageRating: number;
        totalRatings: number;
        firstRatingAt: Date;
        dish: { _id: mongoose.Types.ObjectId; name: string };
    }>([
        {
            $match: {
                restaurant_id: restaurantObjectId,
                deleted: false,
                dishRatings: { $exists: true, $ne: [] },
            },
        },
        { $unwind: '$dishRatings' },
        {
            $addFields: {
                normalizedDishId: {
                    $cond: [
                        { $eq: [{ $type: '$dishRatings.dish_id' }, 'objectId'] },
                        '$dishRatings.dish_id',
                        { $toObjectId: '$dishRatings.dish_id' },
                    ],
                },
            },
        },
        {
            $group: {
                _id: '$normalizedDishId',
                averageRating: { $avg: '$dishRatings.rating' },
                totalRatings: { $sum: 1 },
                firstRatingAt: { $min: '$createdAt' },
            },
        },
        {
            $lookup: {
                from: 'dishes',
                localField: '_id',
                foreignField: '_id',
                as: 'dish',
            },
        },
        { $unwind: '$dish' },
        {
            $sort: {
                averageRating: -1,
                totalRatings: -1,
                firstRatingAt: 1,
                'dish.name': 1,
            },
        },
        { $limit: 1 },
    ]);

    if (!aggregated.length) {
        return {
            restaurantId,
            restaurantName: restaurant.profile.name,
            topDish: null,
        };
    }

    const topDish = aggregated[0];

    return {
        restaurantId,
        restaurantName: restaurant.profile.name,
        topDish: {
            dishId: String(topDish.dish._id),
            name: topDish.dish.name,
            averageRating: Number(topDish.averageRating.toFixed(2)),
            totalRatings: topDish.totalRatings,
        },
    };
};

const getRestaurantDishesWithRatings = async (restaurantId: string): Promise<IDishRatingSummary[]> => {
    const restaurantObjectId = toObjectId(restaurantId, 'restaurantId');
    const restaurant = await RestaurantModel.findById(restaurantObjectId).active().select('_id').lean();

    if (!restaurant) {
        throw new DishRatingServiceError(404, 'Restaurant not found');
    }

    const [dishes, ratingStats] = await Promise.all([
        DishModel.find({ restaurant_id: restaurantObjectId })
            .select('_id name images')
            .sort({ name: 1 })
            .lean(),
        ReviewModel.aggregate<{
            _id: mongoose.Types.ObjectId;
            averageRating: number;
            totalRatings: number;
        }>([
            {
                $match: {
                    restaurant_id: restaurantObjectId,
                    deleted: false,
                    dishRatings: { $exists: true, $ne: [] },
                },
            },
            { $unwind: '$dishRatings' },
            {
                $addFields: {
                    normalizedDishId: {
                        $cond: [
                            { $eq: [{ $type: '$dishRatings.dish_id' }, 'objectId'] },
                            '$dishRatings.dish_id',
                            { $toObjectId: '$dishRatings.dish_id' },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$normalizedDishId',
                    averageRating: { $avg: '$dishRatings.rating' },
                    totalRatings: { $sum: 1 },
                },
            },
        ]),
    ]);

    const ratingByDishId = new Map(
        ratingStats.map((stat) => [String(stat._id), stat])
    );

    const response = dishes.map((dish) => {
        const stat = ratingByDishId.get(String(dish._id));
        const averageRating = stat ? Number(stat.averageRating.toFixed(2)) : 0;
        const totalRatings = stat?.totalRatings ?? 0;

        return {
            dishId: String(dish._id),
            name: dish.name,
            averageRating,
            totalRatings,
            images: dish.images,
        };
    });

    response.sort((a, b) => {
        if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
        if (b.totalRatings !== a.totalRatings) return b.totalRatings - a.totalRatings;
        return a.name.localeCompare(b.name);
    });

    return response;
};

export default {
    createDishRating,
    getRestaurantTopDish,
    getRestaurantDishesWithRatings,
};