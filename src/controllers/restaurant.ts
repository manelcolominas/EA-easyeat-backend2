import { NextFunction, Request, Response } from 'express';
import RestaurantService from '../services/restaurant.js';
import { getPaginationOptions } from '../utils/pagination';

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

const createRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const saved = await RestaurantService.createRestaurant(req.body);
        return res.status(201).json(saved);
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(409).json({
                message: 'A restaurant with this name already exists in this city.',
                error,
            });
        }
        if (error?.name === 'ValidationError') {
            return res.status(422).json({
                message: 'Validation failed',
                error: error.errors || error.message,
            });
        }
        return res.status(500).json({ error });
    }
};

const readRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getRestaurant(req.params.restaurantId);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDeletedRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getDeletedRestaurant(req.params.restaurantId);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Deleted restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { restaurants, total } = await RestaurantService.getAllRestaurants(skip, limit);
        return res.status(200).json({
            data: restaurants,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { restaurants, total } = await RestaurantService.getAllDeletedRestaurants(skip, limit);
        return res.status(200).json({
            data:  restaurants,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.updateRestaurant(
            req.params.restaurantId,
            req.body
        );
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(409).json({
                message: 'A restaurant with this name already exists in this city.',
                error,
            });
        }
        if (error?.name === 'ValidationError') {
            return res.status(422).json({
                message: 'Validation failed',
                error: error.errors || error.message,
            });
        }
        return res.status(500).json({ error });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete / restore
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DELETE /restaurants/:restaurant_id/soft
 * Sets deletedAt = now. The restaurant disappears from all normal queries.
 * Returns 404 if already soft-deleted or not found.
 */
const softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.softDeleteRestaurant(req.params.restaurantId);
        return restaurant
            ? res.status(200).json({ message: 'Restaurant deactivated.', restaurant })
            : res.status(404).json({ message: 'Restaurant not found or already deactivated.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/**
 * PATCH /restaurants/:restaurant_id/restore
 * Clears deletedAt, making the restaurant visible again.
 * Returns 404 if the restaurant is not found or is already active.
 */
const restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.restoreRestaurant(req.params.restaurantId);
        return restaurant
            ? res.status(200).json({ message: 'Restaurant restored.', restaurant })
            : res.status(404).json({ message: 'Restaurant not found or already active.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/**
 * DELETE /restaurants/:restaurant_id/hard
 * Permanently removes the document from the database. Irreversible.
 * Use only for admin operations or GDPR erasure requests.
 */
const hardDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.hardDeleteRestaurant(req.params.restaurantId);
        return restaurant
            ? res.status(200).json({ message: 'Restaurant permanently deleted.', restaurant })
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Read variants
// ─────────────────────────────────────────────────────────────────────────────

const getRestaurantCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { customers, total } = await RestaurantService.getRestaurantCustomers( req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { customers, total } = await RestaurantService.getDeletedRestaurantCustomers( req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getRestaurantFull = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getRestaurantFull(req.params.restaurantId);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantFull = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getDeletedRestaurantFull(req.params.restaurantId);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Deleted restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getNearby = async (req: Request, res: Response, next: NextFunction) => {
    const { lng, lat, maxDistance } = req.query;
    if (!lng || !lat)
        return res.status(400).json({ message: 'lng and lat query params are required.' });

    try {
        const restaurants = await RestaurantService.getNearby(
            parseFloat(lng as string),
            parseFloat(lat as string),
            maxDistance ? parseFloat(maxDistance as string) : 5_000
        );
        return res.status(200).json(restaurants);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { badges, total } = await RestaurantService.getBadges(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { badges, total } = await RestaurantService.getDeletedRestaurantBadges(req.params.restaurantId, skip, limit);
        return res.status(200).json(
            {
                data: badges,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
            })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistics = await RestaurantService.getStatistics(req.params.restaurantId);
        return res.status(200).json(statistics);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistics = await RestaurantService.getDeletedRestaurantStatistics(req.params.restaurantId);
        return res.status(200).json(statistics)
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getTopDish = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurantId = req.params.restaurantId;
        const topDish = await RestaurantService.getTopDishByRestaurant(restaurantId);
        return res.status(200).json(topDish)
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getFiltered = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lng, lat, radiusMeters, categories, minGlobalRating, city, openNow, openAt } = req.query;

        const results = await RestaurantService.getFilteredRestaurants({
            lng:            lng            ? parseFloat(lng            as string) : undefined,
            lat:            lat            ? parseFloat(lat            as string) : undefined,
            radiusMeters:   radiusMeters   ? parseFloat(radiusMeters   as string) : undefined,
            categories:     categories     ? (categories as string).split(',')    : undefined,
            minGlobalRating: minGlobalRating ? parseFloat(minGlobalRating as string) : undefined,
            city:           city           ? (city as string)                     : undefined,
            openNow:        openNow === 'true',
            openAt:         openAt         ? (openAt as string)                   : undefined,
        });

        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { employees, total } = await RestaurantService.getEmployees(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: employees,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { employees, total} = await RestaurantService.getDeletedRestaurantEmployees(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: employees,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDishes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { dishes, total } = await RestaurantService.getDishes(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: dishes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantDishes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { dishes, total } = await RestaurantService.getDeletedRestaurantDishes(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: dishes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getRewards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { rewards, total } = await RestaurantService.getRewards(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: rewards,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantRewards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { rewards, total } = await RestaurantService.getDeletedRestaurantRewards(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: rewards,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};


const getVisits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await RestaurantService.getVisits(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantVisits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await RestaurantService.getDeletedRestaurantVisits(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};


const getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { reviews, total } = await RestaurantService.getReviews(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDeletedRestaurantReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { reviews, total } = await RestaurantService.getDeletedRestaurantReviews(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export default {
    createRestaurant,
    readRestaurant,
    readDeletedRestaurant,
    readAll,
    readAllDeleted,
    updateRestaurant,
    softDelete,
    restore,
    hardDelete,
    getRestaurantCustomers,
    getDeletedRestaurantCustomers,
    getRestaurantFull,
    getDeletedRestaurantFull,
    getNearby,
    getBadges,
    getDeletedRestaurantBadges,
    getStatistics,
    getDeletedRestaurantStatistics,
    getTopDish,
    getFiltered,
    getEmployees,
    getDeletedRestaurantEmployees,
    getDishes,
    getDeletedRestaurantDishes,
    getRewards,
    getDeletedRestaurantRewards,
    getVisits,
    getDeletedRestaurantVisits,
    getReviews,
    getDeletedRestaurantReviews,
};
