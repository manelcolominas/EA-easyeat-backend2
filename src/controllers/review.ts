import { NextFunction, Request, Response } from 'express';
import ReviewService, { ReviewServiceError } from '../services/review';

// Crear review
const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedReview = await ReviewService.createReview(req.body);
        return res.status(201).json(savedReview);

    } catch (error) {
        if (error instanceof ReviewServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return next(error);
    }
};

// Obtener una review por ID
const readReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const review = await ReviewService.getReview(req.params.review_id);

        return review
            ? res.status(200).json(review)
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

// Obtener todas las reviews
const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await ReviewService.getAllReviews();
        return res.status(200).json(reviews);

    } catch (error) {
        return next(error);
    }
};

// Actualizar review
const updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedReview = await ReviewService.updateReview(
            req.params.review_id,
            req.body
        );

        return updatedReview
            ? res.status(200).json(updatedReview)
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

// Eliminar review
const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await ReviewService.deleteReview(req.params.review_id);

        return deleted
            ? res.status(200).json({ message: 'Review deleted' })
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

// Obtener reviews por restaurante
const readByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await ReviewService.getReviewsByRestaurant(req.params.restaurant_id);
        return res.status(200).json(reviews);

    } catch (error) {
        return next(error);
    }
};

// Obtener reviews por cliente
const readByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customer_id } = req.params;

        const limit = Number(req.query.limit) || 5;
        const skip = Number(req.query.skip) || 0;
        const minGlobalRatingRaw = req.query.minGlobalRating ?? req.query.minglobalRating;
        const minGlobalRating = minGlobalRatingRaw !== undefined ? Number(minGlobalRatingRaw) : undefined;
        const sortByLikes = req.query.sortByLikes === 'true';

        const result = await ReviewService.getReviewsByCustomer(
            customer_id,
            limit,
            skip,
            minGlobalRating,
            sortByLikes
        );

        return res.status(200).json(result);

    } catch (error) {
        return next(error);
    }
};

// Dar like a una review
const likeReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const review = await ReviewService.likeReview(req.params.review_id);

        return review
            ? res.status(200).json(review)
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

//  TOP DISH
const getRestaurantTopDish = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ReviewService.getRestaurantTopDish(req.params.restaurant_id);
        return res.status(200).json(result);

    } catch (error) {
        if (error instanceof ReviewServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return next(error);
    }
};

//  ALL DISH RATINGS
const getRestaurantDishesWithRatings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ReviewService.getRestaurantDishesWithRatings(req.params.restaurant_id);
        return res.status(200).json(result);

    } catch (error) {
        if (error instanceof ReviewServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return next(error);
    }
};

export default {
    createReview,
    readReview,
    readAll,
    updateReview,
    deleteReview,
    readByRestaurant,
    readByCustomer,
    likeReview,
    getRestaurantTopDish,
    getRestaurantDishesWithRatings
};