import { Response, NextFunction } from 'express';
import DishRatingService from '../services/dishRating';
import { AuthRequest } from '../middleware/auth';

// ─── Create or update a rating ────────────────────────────────────────────────

/**
 * POST /dish-ratings
 * Authenticated customers may only submit a rating under their own customer_id.
 * Admins may submit on behalf of any customer.
 */
const rateOrUpdateDish = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { customer_id, dish_id, rating, comment } = req.body;

    // Enforce ownership: customer can only rate as themselves
    if (req.user?.role !== 'admin' && req.user?.id !== customer_id) {
        return res.status(403).json({ message: 'Access denied: you can only rate as yourself' });
    }

    try {
        const result = await DishRatingService.rateOrUpdateDish(customer_id, dish_id, rating, comment);

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
    const page  = Math.max(1,   parseInt(req.query.page  as string, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 20);

    try {
        const result = await DishRatingService.getRatingsByDish(dish_id, { page, limit });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Get ratings for a customer (paginated) ──────────────────────────────────

const readByCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    const page  = Math.max(1,   parseInt(req.query.page  as string, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 20);

    try {
        const result = await DishRatingService.getRatingsByCustomer(customer_id, { page, limit });
        return res.status(200).json(result);
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
