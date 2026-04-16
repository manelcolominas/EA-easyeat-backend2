import { Request, Response } from 'express';
import StatisticsService from '../services/statistics';
import ReviewService, { ReviewServiceError } from '../services/review';



const createStatistics = async (req: Request, res: Response) => {
    try {
        const saved = await StatisticsService.createStatistics(req.body);
        return res.status(201).json(saved);
    } catch {
        return res.status(500).json({
            message: 'Error creating statistics'
        });
    }
};

const readStatistics = async (req: Request, res: Response) => {
    const statisticsId = req.params.statisticsId || req.params.statistics_id;

    if (!statisticsId) {
        return res.status(400).json({ message: 'statisticsId is required' });
    }

    try {
        const statistics = await StatisticsService.getStatistics(statisticsId);

        if (!statistics) {
            return res.status(404).json({ message: 'Statistics not found' });
        }

        return res.status(200).json(statistics);
    } catch {
        return res.status(500).json({
            message: 'Error fetching statistics'
        });
    }
};

const readAll = async (_req: Request, res: Response) => {
    try {
        const statistics = await StatisticsService.getAllStatistics();
        return res.status(200).json(statistics);
    } catch {
        return res.status(500).json({
            message: 'Error fetching statistics list'
        });
    }
};

const updateStatistics = async (req: Request, res: Response) => {
    const statisticsId = req.params.statisticsId || req.params.statistics_id;

    if (!statisticsId) {
        return res.status(400).json({ message: 'statisticsId is required' });
    }

    try {
        const updated = await StatisticsService.updateStatistics(statisticsId, req.body);

        if (!updated) {
            return res.status(404).json({ message: 'Statistics not found' });
        }

        return res.status(200).json(updated);
    } catch {
        return res.status(500).json({
            message: 'Error updating statistics'
        });
    }
};

const deleteStatistics = async (req: Request, res: Response) => {
    const statisticsId = req.params.statisticsId || req.params.statistics_id;

    if (!statisticsId) {
        return res.status(400).json({ message: 'statisticsId is required' });
    }

    try {
        const deleted = await StatisticsService.deleteStatistics(statisticsId);

        if (!deleted) {
            return res.status(404).json({ message: 'Statistics not found' });
        }

        return res.status(200).json(deleted);
    } catch {
        return res.status(500).json({
            message: 'Error deleting statistics'
        });
    }
};
const getRestaurantTopDish = async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    if (!restaurantId) {
        return res.status(400).json({
            message: 'restaurantId is required'
        });
    }

    try {
        const data = await ReviewService.getRestaurantTopDish(restaurantId);
        return res.status(200).json(data);
    } catch (error) {
        if (error instanceof ReviewServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error fetching top dish'
        });
    }
};

const getRestaurantDishRatings = async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    if (!restaurantId) {
        return res.status(400).json({
            message: 'restaurantId is required'
        });
    }

    try {
        const data = await ReviewService.getRestaurantDishesWithRatings(restaurantId);
        return res.status(200).json(data);
    } catch (error) {
        if (error instanceof ReviewServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error fetching dish ratings'
        });
    }
};



export default {

    createStatistics,
    readStatistics,
    readAll,
    updateStatistics,
    deleteStatistics,
    getRestaurantTopDish,
    getRestaurantDishRatings
};
