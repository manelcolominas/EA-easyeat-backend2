import { NextFunction, Request, Response } from 'express';
import ReviewService, { ReviewServiceError } from '../services/review';
import { AuthRequest } from '../middleware/auth';
import { IReview } from '../models/review';

// Create review
const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const payload: Partial<IReview> = { ...req.body };

        if (!payload.customer_id && authReq.user?.id) {
            payload.customer_id = authReq.user.id as any;
        }

        if (
            authReq.user?.role === 'customer' &&
            payload.customer_id &&
            String(payload.customer_id) !== authReq.user.id
        ) {
            return res.status(403).json({ message: 'Customers can only create their own reviews' });
        }

        const savedReview = await ReviewService.createReview(payload);
        return res.status(201).json(savedReview);

    } catch (error) {
        if (error instanceof ReviewServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return next(error);
    }
};

// Obtain a review by ID
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

const readDeletedReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const review = await ReviewService.getDeletedReview(req.params.review_id);

        return review
            ? res.status(200).json(review)
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

// Obtain all reviews
const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await ReviewService.getAllReviews();
        return res.status(200).json(reviews);

    } catch (error) {
        return next(error);
    }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await ReviewService.getAllDeletedReviews();
        return res.status(200).json(reviews);

    } catch (error) {
        return next(error);
    }
};

// Update review
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

// Delete review
const softDeleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await ReviewService.softDeleteReview(req.params.review_id);

        return deleted
            ? res.status(200).json({ message: 'Review deleted' })
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

const restoreReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restored = await ReviewService.restoreReview(req.params.review_id);

        return restored
            ? res.status(200).json({ message: 'Review restored' })
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

const hardDeleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await ReviewService.hardDeleteReview(req.params.review_id);

        return deleted
            ? res.status(200).json({ message: 'Review deleted' })
            : res.status(404).json({ message: 'Review not found' });

    } catch (error) {
        return next(error);
    }
};

// Obtain reviews by restaurant
const readByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await ReviewService.getReviewsByRestaurant(req.params.restaurant_id);
        return res.status(200).json(reviews);

    } catch (error) {
        return next(error);
    }
};

const readDeletedByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await ReviewService.getDeletedReviewsByRestaurant(req.params.restaurant_id);
        return res.status(200).json(reviews);

    } catch (error) {
        return next(error);
    }
};

// Obtain reviews by customer
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

const readDeletedByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customer_id } = req.params;

        const limit = Number(req.query.limit) || 5;
        const skip = Number(req.query.skip) || 0;
        const minGlobalRating = req.query.minglobalRating !== undefined ? Number(req.query.minglobalRating) : undefined;
        const sortByLikes = req.query.sortByLikes === 'true';

        const result = await ReviewService.getDeletedReviewsByCustomer(
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
    readDeletedReview,
    readAll,
    readAllDeleted,
    updateReview,
    softDeleteReview,
    restoreReview,
    hardDeleteReview,
    readByRestaurant,
    readDeletedByRestaurant,
    readByCustomer,
    readDeletedByCustomer,
    likeReview,
    getRestaurantTopDish,
    getRestaurantDishesWithRatings
};
