import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import BadgeService from '../services/badge';
import { CustomerModel } from '../models/customer';

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

const getBadgesByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customer_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(customer_id)) {
            return res.status(400).json({ message: 'Invalid customer_id format' });
        }

        const customer = await CustomerModel.findById(customer_id)
            .populate('badges')
            .lean();

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json(customer.badges || []);
    } catch (error) {
        return next(error);
    }
};

export default {
    createBadge,
    readBadge,
    readAll,
    updateBadge,
    deleteBadge,
    getBadgesByCustomer
};
