import { NextFunction, Request, Response } from 'express';
import RestaurantService from '../services/restaurant.js';

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
        const restaurant = await RestaurantService.getRestaurant(req.params.restaurant_id);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurants = await RestaurantService.getAllRestaurants();
        return res.status(200).json(restaurants);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.updateRestaurant(
            req.params.restaurant_id,
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
        const restaurant = await RestaurantService.softDeleteRestaurant(req.params.restaurant_id);
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
        const restaurant = await RestaurantService.restoreRestaurant(req.params.restaurant_id);
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
        const restaurant = await RestaurantService.hardDeleteRestaurant(req.params.restaurant_id);
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

const getRestaurantWithCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getRestaurantWithCustomers(
            req.params.restaurant_id
        );
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getRestaurantFull = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getRestaurantFull(req.params.restaurant_id);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
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
        const badges = await RestaurantService.getBadges(req.params.restaurant_id);
        return badges
            ? res.status(200).json(badges)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistics = await RestaurantService.getStatistics(req.params.restaurant_id);
        return statistics
            ? res.status(200).json(statistics)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getFiltered = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lng, lat, radiusMeters, categories, minglobalRating, city, openNow, openAt } = req.query;

        const results = await RestaurantService.getFilteredRestaurants({
            lng:          lng          ? parseFloat(lng          as string) : undefined,
            lat:          lat          ? parseFloat(lat          as string) : undefined,
            radiusMeters: radiusMeters ? parseFloat(radiusMeters as string) : undefined,
            categories:   categories   ? (categories as string).split(',')  : undefined,
            minglobalRating:    minglobalRating    ? parseFloat(minglobalRating    as string) : undefined,
            city:         city         ? (city as string)                   : undefined,
            openNow:      openNow === 'true',
            openAt:       openAt       ? (openAt as string)                 : undefined,
        });

        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getEmployees(req.params.restaurant_id);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getDishes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getDishes(req.params.restaurant_id);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getRewards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getRewards(req.params.restaurant_id);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getVisits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getVisits(req.params.restaurant_id);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurant = await RestaurantService.getReviews(req.params.restaurant_id);
        return restaurant
            ? res.status(200).json(restaurant)
            : res.status(404).json({ message: 'Restaurant not found.' });
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
    readAll,
    updateRestaurant,
    softDelete,
    restore,
    hardDelete,
    getRestaurantWithCustomers,
    getRestaurantFull,
    getNearby,
    getBadges,
    getStatistics,
    getFiltered,
    getEmployees,
    getDishes,
    getRewards,
    getVisits,
    getReviews,
};