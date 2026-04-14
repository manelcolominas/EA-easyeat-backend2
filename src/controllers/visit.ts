import { NextFunction, Request, Response } from 'express';
import VisitService from '../services/visit';

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
        // ✅ Filtro soft delete: si tiene deletedAt, devolvemos 404
        if (visit && (visit as any).deletedAt) return res.status(404).json({ message: 'not found' });
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id, restaurant_id } = req.query;
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    try {
        const filter = {
            customer_id:   customer_id   as string | undefined,
            restaurant_id: restaurant_id as string | undefined,
            deletedAt:     null // ✅ solo visitas activas
        };

        const result = await VisitService.getAllVisits(filter, page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getVisitFull = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const visit = await VisitService.getVisitFull(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
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

const deleteVisit = async (req: Request, res: Response, next: NextFunction) => {
    const visit_id = req.params.visit_id;
    try {
        const visit = await VisitService.deleteVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default { createVisit, readVisit, readAll, getVisitFull, updateVisit, deleteVisit };