import { NextFunction, Request, Response } from 'express';
import DishRatingService, { DishRatingServiceError } from '../services/dishRating';

const createDishRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedRating = await DishRatingService.createDishRating(req.body);
        return res.status(201).json(savedRating);
    } catch (error) {
        if (error instanceof DishRatingServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return next(error);
    }
};

export default {
    createDishRating,
};