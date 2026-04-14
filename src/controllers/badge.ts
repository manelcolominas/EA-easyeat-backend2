import { NextFunction, Request, Response } from 'express';
import BadgeService from '../services/badge';

const createBadge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedBadge = await BadgeService.createBadge(req.body);
        return res.status(201).json(savedBadge);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readBadge = async (req: Request, res: Response, next: NextFunction) => {
    const badge_id = req.params.badge_id;

    try {
        const badge = await BadgeService.getBadge(badge_id);
        return badge ? res.status(200).json(badge) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const badges = await BadgeService.getAllBadges();
        return res.status(200).json(badges);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateBadge = async (req: Request, res: Response, next: NextFunction) => {
    const badge_id = req.params.badge_id;

    try {
        const updatedBadge = await BadgeService.updateBadge(badge_id, req.body);
        return updatedBadge ? res.status(201).json(updatedBadge) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteBadge = async (req: Request, res: Response, next: NextFunction) => {
    const badge_id = req.params.badge_id;

    try {
        const badge = await BadgeService.deleteBadge(badge_id);
        return badge ? res.status(200).json(badge) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createBadge,
    readBadge,
    readAll,
    updateBadge,
    deleteBadge
};
