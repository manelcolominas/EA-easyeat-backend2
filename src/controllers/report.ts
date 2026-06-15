import { NextFunction, Request, Response } from 'express';
import ReportService from '../services/report';
import { getPaginationOptions } from '../utils/pagination';
import { AuthRequest } from '../middleware/auth';

const createReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const restaurantId: any = req.params.restaurantId;
        const userId: any = req.user?.id;
        const reason: any = req.body.reason;

        const reportData = {
            restaurantId,
            userId,
            reason,
        };

        const savedReport = await ReportService.createReport(reportData);
        return res.status(201).json(savedReport);
    } catch (error) {
        return next(error);
    }
};

const updateReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await ReportService.updateReport(req.params.reportId, req.body);

        return updated
            ? res.status(200).json({ message: 'Report updated successfully', data: updated })
            : res.status(404).json({ message: 'Report not found' });

    } catch (error) {
        return next(error);
    }
};

const readAllReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { reports, total } = await ReportService.getAllReports(skip, limit);
        return res.status(200).json({
            data: reports,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await ReportService.deleteReport(req.params.reportId);

        return deleted 
            ? res.status(200).json(deleted)
            : res.status(404).json({ message: 'Report not found' });
    } catch (error) {
        return next(error);
    }
};

export default {
    createReport,
    readAllReports,
    updateReport,
    deleteReport
};