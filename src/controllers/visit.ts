import { NextFunction, Request, Response } from 'express';
import VisitService from '../services/visit';
import { getPaginationOptions } from '../utils/pagination';

const createVisit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedVisit = await VisitService.createVisit(req.body);
        return res.status(201).json(savedVisit);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readVisit = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const visit = await VisitService.getVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDeletedVisit = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const visit = await VisitService.getDeletedVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await VisitService.getAllVisits(skip, limit);
        
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await VisitService.getAllDeletedVisits(skip, limit);
        
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customer_id } = req.params;
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await VisitService.getByCustomer(customer_id, skip, limit);
        
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { restaurant_id } = req.params;
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await VisitService.getByRestaurant(restaurant_id, skip, limit);
        
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateVisit = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const updatedVisit = await VisitService.updateVisit(visit_id, req.body);
        return updatedVisit ? res.status(200).json(updatedVisit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const softDeleteVisit = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const visit = await VisitService.softDeleteVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const restoreVisit = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const visit = await VisitService.restoreVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const hardDeleteVisit = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const visit = await VisitService.hardDeleteVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createVisit,
    readVisit,
    readDeletedVisit,
    readAll,
    readAllDeleted,
    readByCustomer,
    readByRestaurant,
    updateVisit,
    softDeleteVisit,
    restoreVisit,
    hardDeleteVisit
};