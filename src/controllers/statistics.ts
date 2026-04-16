import { NextFunction, Request, Response } from 'express';
import StatisticsService from '../services/statistics';

const createStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const saved = await StatisticsService.createStatistics(req.body);
        return res.status(201).json(saved);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readStatistics = async (req: Request, res: Response, next: NextFunction) => {
    const { statistics_id } = req.params;
    try {
        const statistics = await StatisticsService.getStatistics(statistics_id);
        return statistics ? res.status(200).json(statistics) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistics = await StatisticsService.getAllStatistics();
        return res.status(200).json(statistics);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateStatistics = async (req: Request, res: Response, next: NextFunction) => {
    const { statistics_id } = req.params;
    try {
        const updated = await StatisticsService.updateStatistics(statistics_id, req.body);
        return updated ? res.status(201).json(updated) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteStatistics = async (req: Request, res: Response, next: NextFunction) => {
    const { statistics_id } = req.params;
    try {
        const statistics = await StatisticsService.deleteStatistics(statistics_id);
        return statistics ? res.status(200).json(statistics) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default { createStatistics, readStatistics, readAll, updateStatistics, deleteStatistics };
