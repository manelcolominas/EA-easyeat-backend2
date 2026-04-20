import mongoose, { PipelineStage } from 'mongoose';
import { RestaurantModel, IRestaurant } from '../models/restaurant';
import { DishRatingModel, IDishRating }              from '../models/dishRating';
import { CustomerModel, ICustomer } from '../models/customer';
import { BadgeModel, IBadge } from '../models/badge';
import { DishModel, IDish } from '../models/dish';
import { EmployeeModel, IEmployee } from '../models/employee';
import {  RewardModel, IReward } from '../models/reward';
import { ReviewModel, IReview } from '../models/review';
import { StatisticsModel, IStatistics } from '../models/statistics';
import { VisitModel, IVisit } from '../models/visit';
// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

const createRestaurant = async (data: Partial<IRestaurant>): Promise<IRestaurant> => {
    const restaurant = new RestaurantModel(data);
    return restaurant.save();
};

const getRestaurant = async (restaurant_id: string): Promise<IRestaurant | null> => {
    const restaurant = await RestaurantModel
        .findById(restaurant_id)
        .active()
        .select('profile.name profile.globalRating profile.category profile.image profile.location.city')
        .lean<IRestaurant>();

    if (!restaurant) return null;

    return {
        ...restaurant,
        profile: {
            ...restaurant.profile,
            image: restaurant.profile.image?.slice(0, 3)
        }
    };
};

const getDeletedRestaurant = async (restaurantId: string): Promise<IRestaurant | null> => {
    return RestaurantModel.findOne({ _id: restaurantId, deletedAt: { $ne: null } }).lean();
};

const getAllRestaurants = async (skip: number, limit: number): Promise<{ restaurants: IRestaurant[]; total: number }> => {
    const [restaurants, total] = await Promise.all([
        RestaurantModel.find()
            .active()
            .select('profile.name profile.globalRating profile.category profile.image profile.location.city')
            .skip(skip)
            .limit(limit)
            .lean<IRestaurant[]>(),
        RestaurantModel.countDocuments({ deletedAt: null })
    ]);

    const formattedRestaurants = restaurants.map((r) => ({
        ...r,
        profile: {
            ...r.profile,
            image: r.profile.image?.slice(0, 3)
        }
    }));

    return { restaurants: formattedRestaurants, total };
};

const getAllDeletedRestaurants = async ( skip: number, limit: number ): Promise<{ restaurants: IRestaurant[]; total: number }> => {
    const filter = { deletedAt: { $ne: null } };
    const [restaurants, total] = await Promise.all([
        RestaurantModel.find(filter)
            .select('profile.name profile.globalRating profile.category profile.image profile.location.city')
            .skip(skip)
            .limit(limit)
            .lean<IRestaurant[]>(),
        RestaurantModel.countDocuments(filter)
    ]);

    const formattedRestaurants = restaurants.map((r) => ({
        ...r,
        profile: {
            ...r.profile,
            image: r.profile.image?.slice(0, 3)
        }
    }));

    return { restaurants: formattedRestaurants, total };
};

const updateRestaurant = async ( restaurant_id: string, data: Partial<IRestaurant> ): Promise<IRestaurant | null> => {
    const restaurant = await RestaurantModel.findById(restaurant_id).active();
    if (!restaurant) return null;
    restaurant.set(data);
    return restaurant.save();
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete / restore
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soft-delete: sets deletedAt to now.
 * Returns null if the restaurant is not found OR is already soft-deleted.
 */
const softDeleteRestaurant = async (restaurant_id: string): Promise<IRestaurant | null> => {
    return RestaurantModel.findOneAndUpdate(
        { _id: restaurant_id, deletedAt: null },          // guard: only active docs
        { deletedAt: new Date() },
        { new: true }
    ).lean();
};

/**
 * Restore: clears deletedAt, making the restaurant active again.
 * Returns null if the restaurant is not found OR is already active.
 */
const restoreRestaurant = async (restaurant_id: string): Promise<IRestaurant | null> => {
    return RestaurantModel.findOneAndUpdate(
        { _id: restaurant_id, deletedAt: { $ne: null } }, // guard: only deleted docs
        { deletedAt: null },
        { new: true }
    ).lean();
};

/**
 * Hard-delete: permanently removes the document.
 * Use only for admin operations or GDPR erasure requests.
 */
const hardDeleteRestaurant = async (restaurant_id: string): Promise<IRestaurant | null> => {
    return RestaurantModel.findByIdAndDelete(restaurant_id).lean();
};

// ─────────────────────────────────────────────────────────────────────────────
// Read variants
// ─────────────────────────────────────────────────────────────────────────────

const getRestaurantCustomers = async (restaurant_id: string, skip: number, limit: number ): Promise<{ customers: ICustomer[]; total: number }> => {
    const filter = { favoriteRestaurants: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [customers, total] = await Promise.all([
        CustomerModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<ICustomer[]>(),
        CustomerModel.countDocuments(filter)
    ]);
    return { customers, total };
};

const getDeletedRestaurantCustomers = async (restaurant_id: string, skip: number, limit: number): Promise<{ customers: ICustomer[]; total: number }> => {
    const filter = { favoriteRestaurants: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [customers, total] = await Promise.all([
        CustomerModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<ICustomer[]>(),
        CustomerModel.countDocuments(filter)
    ]);

    return { customers, total };
};

const getRestaurantFull = async (restaurant_id: string): Promise<IRestaurant | null> => {
    return RestaurantModel
        .findById(restaurant_id).active()
        .populate('employees')
        .populate('rewards')
        .populate('badges')
        .populate('statistics')
        .populate('dishes')
        .populate('visits')
        .populate('reviews')
        .lean<IRestaurant>();
};

const getDeletedRestaurantFull = async (restaurantId: string): Promise<IRestaurant | null> => {
    return RestaurantModel
        .findOne({ _id: restaurantId, deletedAt: { $ne: null } })
        .populate('employees')
        .populate('rewards')
        .populate('badges')
        .populate('statistics')
        .populate('dishes')
        .populate('visits')
        .populate('reviews')
        .lean<IRestaurant>();
};

const getNearby = async ( lng: number, lat: number,
 maxDistance: number ): Promise<IRestaurant[]> => {
    return RestaurantModel
        .find({ deletedAt: null,'profile.location.coordinates': {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: maxDistance,
                } } }).lean();
};

const getBadges = async (restaurant_id: string, skip: number, limit: number): Promise<{badges: IBadge[]; total: number}> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [badges, total] = await Promise.all([
        BadgeModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<IBadge[]>(),
        BadgeModel.countDocuments(filter)
    ]);
    return { badges, total };
};

const getDeletedRestaurantBadges = async (restaurant_id: string, skip: number, limit: number): Promise<{badges: IBadge[]; total: number}> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: { $ne: null } };
    const [badges, total] = await Promise.all([
        BadgeModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<IBadge[]>(),
        BadgeModel.countDocuments(filter)
    ]);
    return { badges, total };
};

const getStatistics = async (restaurant_id: string): Promise<IStatistics> => {
    const filter = { restaurant_id: new mongoose.Types.ObjectId(restaurant_id) };
    const stats = await StatisticsModel.findOne(filter).lean<IStatistics>();
    return stats;
};

const getDeletedRestaurantStatistics = async (restaurant_id: string): Promise<IStatistics> => {
    const filter = { restaurant_id: new mongoose.Types.ObjectId(restaurant_id), deletedAt: { $ne: null } };
    const stats = await StatisticsModel.findOne(filter).select('statistics').populate('statistics').lean<IStatistics>();
    return stats;
};

const getEmployees = async (restaurant_id: string, skip: number, limit: number): Promise<{ employees: IEmployee[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [employees, total] = await Promise.all([
        EmployeeModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<IEmployee[]>(),
        EmployeeModel.countDocuments(filter)
    ]);
    return { employees, total };
};

const getDeletedRestaurantEmployees = async (restaurant_id: string, skip: number, limit: number): Promise<{ employees: IEmployee[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: { $ne: null } };
    const [employees, total] = await Promise.all([
        EmployeeModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<IEmployee[]>(),
        EmployeeModel.countDocuments(filter)
    ]);
    return { employees, total };
};

const getDishes = async (restaurant_id: string, skip: number, limit: number): Promise<{ dishes: IDish[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [dishes, total] = await Promise.all([
        DishModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<IDish[]>(),
        DishModel.countDocuments(filter)
    ]);
    return { dishes, total };
};

const getDeletedRestaurantDishes = async (restaurant_id: string, skip: number, limit: number): Promise<{ dishes: IDish[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [dishes, total] = await Promise.all([
        DishModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean<IDish[]>(),
        DishModel.countDocuments(filter)
    ]);
    return { dishes, total };
};

const getTopDishByRestaurant = async (restaurantId: string): Promise<IDish | null> => {
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) return null;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                restaurant_id: new mongoose.Types.ObjectId(restaurantId),
                deletedAt:     null,
            },
        },
        {
            $group: {
                _id:         '$dish_id',
                avgRating:   { $avg: '$rating' },
                ratingCount: { $sum: 1 },
            },
        },
        { $sort: { avgRating: -1, ratingCount: -1 } },
        { $limit: 1 },
        {
            $lookup: {
                from:         'dishes',
                localField:   '_id',
                foreignField: '_id',
                as:           'dish',
            },
        },
        { $unwind: '$dish' },
        { $match: { 'dish.active': true } },
        { $replaceRoot: { newRoot: '$dish' } },
    ];

    const [topDish] = await DishRatingModel.aggregate<IDish>(pipeline);
    return topDish ?? null;
};

const getRewards = async (restaurant_id: string, skip: number, limit: number): Promise<{ rewards: IReward[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [rewards, total] = await Promise.all([
        RewardModel.find(filter).skip(skip).limit(limit).lean<IReward[]>(),
        RewardModel.countDocuments(filter)
        ]);
    return { rewards, total };
};

const getDeletedRestaurantRewards = async (restaurant_id: string, skip: number, limit: number): Promise<{ rewards: IReward[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: { $ne: null } };
    const [rewards, total] = await Promise.all([
        RewardModel.find(filter).skip(skip).limit(limit).lean<IReward[]>(),
        RewardModel.countDocuments(filter)
    ]);
    return { rewards, total };
};

const getVisits = async (restaurant_id: string, skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [visits, total] = await Promise.all([
        VisitModel.find(filter).skip(skip).limit(limit).lean<IVisit[]>(),
        VisitModel.countDocuments(filter)
    ]);
    return { visits, total };
};

const getDeletedRestaurantVisits = async (restaurant_id: string, skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: { $ne: null } };
    const [visits, total] = await Promise.all([
        VisitModel.find(filter).skip(skip).limit(limit).lean<IVisit[]>(),
        VisitModel.countDocuments(filter)
    ]);
    return { visits, total };
};

const getReviews = async (restaurant_id: string, skip: number, limit: number): Promise<{ reviews: IReview[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: null };
    const [reviews, total] = await Promise.all([
        VisitModel.find(filter).skip(skip).limit(limit).lean<IReview[]>(),
        VisitModel.countDocuments(filter)
    ]);
    return { reviews, total };
};

const getDeletedRestaurantReviews = async (restaurant_id: string, skip: number, limit: number): Promise<{ reviews: IReview[]; total: number }> => {
    const filter = { badges: new mongoose.Types.ObjectId(restaurant_id), deletedAt: { $ne: null} };
    const [reviews, total] = await Promise.all([
        VisitModel.find(filter).skip(skip).limit(limit).lean<IReview[]>(),
        VisitModel.countDocuments(filter)
    ]);
    return { reviews, total };
};

// ─────────────────────────────────────────────────────────────────────────────
// globalRating recalculation
// ─────────────────────────────────────────────────────────────────────────────

const updateGlobalRating = async ( restaurant_id: string, newAverage: number
): Promise<IRestaurant | null> => {
    const clamped = Math.min(10, Math.max(0, newAverage));
    return RestaurantModel.findByIdAndUpdate( restaurant_id, { 'profile.globalRating': clamped },
            { new: true, runValidators: true } ).lean();
};

// ─────────────────────────────────────────────────────────────────────────────
// Advanced filtering
// ─────────────────────────────────────────────────────────────────────────────

export interface RestaurantFilterParams {
    lng?: number;
    lat?: number;
    radiusMeters?: number;
    categories?: string[];
    minGlobalRating?: number;
    city?: string;
    openNow?: boolean;
    openAt?: string;
}

export interface RestaurantWithDistance extends IRestaurant {
    distance?: number;
}

function getDayKey(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
}

function buildOpenAtStages(date: Date): PipelineStage[] {
    const dayKey         = getDayKey(date);
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    const toMinutes = (fieldRef: string) => ({
        $add: [
            {
                $multiply: [
                    { $toInt: { $arrayElemAt: [{ $split: [fieldRef, ':'] }, 0] } },
                    60,
                ],
            },
            { $toInt: { $arrayElemAt: [{ $split: [fieldRef, ':'] }, 1] } },
        ],
    });

    const addFieldsStage: PipelineStage = {
        $addFields: {
            _isOpen: {
                $reduce: {
                    input:        { $ifNull: [`$profile.timetable.${dayKey}`, []] },
                    initialValue: false,
                    in: {
                        $or: [
                            '$$value',
                            {
                                $and: [
                                    { $gte: [currentMinutes, toMinutes('$$this.open')]  },
                                    { $lt:  [currentMinutes, toMinutes('$$this.close')] },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    };

    return [
        addFieldsStage,
        { $match:   { _isOpen: true } },
        { $project: { _isOpen: 0   } },
    ];
}

const getFilteredRestaurants = async ( params: RestaurantFilterParams ): Promise<RestaurantWithDistance[]> => {
    const { lng, lat, radiusMeters = 5_000, categories, minGlobalRating, city, openNow, openAt } = params;

    const hasGeo = lng !== undefined && lat !== undefined && isFinite(lng) && isFinite(lat);
    const pipeline: PipelineStage[] = [];
    const baseFilter: Record<string, unknown> = { deletedAt: null };

    if (hasGeo) {
        if (city)               baseFilter['profile.location.city'] = { $regex: city, $options: 'i' };
        if (minGlobalRating)    baseFilter['profile.globalRating']  = { $gte: minGlobalRating };
        if (categories?.length) baseFilter['profile.category']      = { $in: categories };

        pipeline.push({
            $geoNear: {
                near:          { type: 'Point', coordinates: [lng!, lat!] },
                distanceField: 'distance',
                maxDistance:   radiusMeters,
                spherical:     true,
                query:         baseFilter,
            },
        } as PipelineStage);
    }
    else {
        if (city)               baseFilter['profile.location.city'] = { $regex: city, $options: 'i' };
        if (minGlobalRating)    baseFilter['profile.globalRating']  = { $gte: minGlobalRating };
        if (categories?.length) baseFilter['profile.category']      = { $in: categories };

        pipeline.push({ $match: baseFilter });
    }

    const targetDate = openAt ? new Date(openAt) : openNow ? new Date() : null;
    if (targetDate && isFinite(targetDate.getTime())) {
        pipeline.push(...buildOpenAtStages(targetDate));
    }

    if (!hasGeo) {
        pipeline.push({ $sort: { 'profile.globalRating': -1, 'profile.name': 1 } });
    }

    return RestaurantModel.aggregate<RestaurantWithDistance>(pipeline).exec();
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export default {
    createRestaurant,
    getRestaurant,
    getDeletedRestaurant,
    getAllRestaurants,
    getAllDeletedRestaurants,
    updateRestaurant,
    softDeleteRestaurant,
    restoreRestaurant,
    hardDeleteRestaurant,
    getRestaurantCustomers,
    getDeletedRestaurantCustomers,
    getRestaurantFull,
    getDeletedRestaurantFull,
    getNearby,
    getBadges,
    getDeletedRestaurantBadges,
    getStatistics,
    getDeletedRestaurantStatistics,
    getEmployees,
    getDeletedRestaurantEmployees,
    getDishes,
    getDeletedRestaurantDishes,
    getTopDishByRestaurant,
    getRewards,
    getDeletedRestaurantRewards,
    getVisits,
    getDeletedRestaurantVisits,
    getReviews,
    getDeletedRestaurantReviews,
    updateGlobalRating,
    getFilteredRestaurants,
};
