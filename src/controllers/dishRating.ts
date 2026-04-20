import { Response, NextFunction } from 'express';
import DishRatingService from '../services/dishRating';
import { AuthRequest } from '../middleware/auth';
import { getPaginationOptions } from '../utils/pagination';

// ─── Create or update a rating ────────────────────────────────────────────────

/**
 * POST /dish-ratings
 * Authenticated customers may only submit a rating under their own customer_id.
 * Admins may submit on behalf of any customer.
 */
const rateOrUpdateDish = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { customer_id, dish_id, rating } = req.body;

    // Enforce ownership: customer can only rate as themselves
    if (req.user?.role !== 'admin' && req.user?.id !== customer_id) {
        return res.status(403).json({ message: 'Access denied: you can only rate as yourself' });
    }

    try {
        const result = await DishRatingService.rateOrUpdateDish(customer_id, dish_id, rating);

        if (!result) {
            return res.status(404).json({ message: 'Dish not found or not active' });
        }

        return res.status(result.isNew ? 201 : 200).json(result.data);
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'A rating already exists for this customer and dish.' });
        }
        return res.status(500).json({ error });
    }
};

// ─── Get ratings for a dish (paginated) ──────────────────────────────────────

const readByDish = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { dishRatings, total } = await DishRatingService.getRatingsByDish(dish_id, skip, limit);
        return res.status(200).json({
            data: dishRatings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Get ratings for a customer (paginated) ──────────────────────────────────

const readByCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { dishRatings, total } = await DishRatingService.getRatingsByCustomer(customer_id, skip, limit);
        return res.status(200).json({
            data: dishRatings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Soft delete a rating ─────────────────────────────────────────────────────

/**
 * DELETE /dish-ratings/:id/soft
 * Customers can only delete their own rating. Admins can delete any.
 */
const softDeleteRating = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // Non-admin customers may only delete their own rating
    const customer_id = req.user?.role === 'admin' ? undefined : req.user?.id;

    try {
        const result = await DishRatingService.softDeleteRating(id, customer_id);
        return result
            ? res.status(200).json({ message: 'Rating deleted', result })
            : res.status(404).json({ message: 'Rating not found or already deleted' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Rating summary for a dish ────────────────────────────────────────────────

const getRatingSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { dish_id } = req.params;

    try {
        const summary = await DishRatingService.getDishRatingSummary(dish_id);
        return res.status(200).json(summary);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default { rateOrUpdateDish, readByDish, readByCustomer, softDeleteRating, getRatingSummary };
