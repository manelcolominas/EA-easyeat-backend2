import { NextFunction, Request, Response } from 'express';
import VisitService from '../services/visit';
import { getPaginationOptions } from '../utils/pagination';
import { getSharedIdempotencyService } from 'express-idempotency';
import Logging from '../library/logging';

const createVisit = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const idempotencyService = getSharedIdempotencyService();
  Logging.info(`Idempotency key: ${idempotencyService.extractIdempotencyKeyFromReq(req)}`);
  if (idempotencyService.isHit(req)) {
    return;
  }

  try {
    const savedVisit = await VisitService.createVisit(req.body);

    const response = {
      _id: savedVisit._id,
      customer_id: savedVisit.customer_id,
      restaurant_id: savedVisit.restaurant_id,
      employee_id: savedVisit.employee_id,
      date: savedVisit.date,
      pointsEarned: savedVisit.pointsEarned,
      billAmount: savedVisit.billAmount
    };

    return res.status(201).json(response);
  } catch (error: any) {
    await idempotencyService.reportError(req);
    return res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

const readVisit = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const visit_id = req.params.visit_id;
  try {
    const visit = await VisitService.getVisit(visit_id);
    return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const readDeletedVisit = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const visit_id = req.params.visit_id;
  try {
    const visit = await VisitService.getDeletedVisit(visit_id);
    return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const readAll = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { visits, total } = await VisitService.getAllVisits(skip, limit);

    return res.status(200).json({
      data: visits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { visits, total } = await VisitService.getAllDeletedVisits(skip, limit);

    return res.status(200).json({
      data: visits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const readByCustomer = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const { customer_id } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { visits, total } = await VisitService.getByCustomer(customer_id, skip, limit);

    return res.status(200).json({
      data: visits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const readDeletedByCustomer = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const { customer_id } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { visits, total } = await VisitService.getDeletedByCustomer(customer_id, skip, limit);

    return res.status(200).json({
      data: visits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const readByRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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

const readDeletedByRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const { restaurant_id } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { visits, total } = await VisitService.getDeletedByRestaurant(restaurant_id, skip, limit);

    return res.status(200).json({
      data: visits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const updateVisit = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const visit_id = req.params.visit_id;
  try {
    const updatedVisit = await VisitService.updateVisit(visit_id, req.body);
    return updatedVisit ? res.status(200).json(updatedVisit) : res.status(404).json({ message: 'not found' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const softDeleteVisit = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const visit_id = req.params.visit_id;
  try {
    const visit = await VisitService.softDeleteVisit(visit_id);
    return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const restoreVisit = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const visit_id = req.params.visit_id;
  try {
    const visit = await VisitService.restoreVisit(visit_id);
    return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const hardDeleteVisit = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const visit_id = req.params.visit_id;
  try {
    const visit = await VisitService.hardDeleteVisit(visit_id);
    return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  createVisit,
  readVisit,
  readDeletedVisit,
  readAll,
  readAllDeleted,
  readByCustomer,
  readDeletedByCustomer,
  readByRestaurant,
  readDeletedByRestaurant,
  updateVisit,
  softDeleteVisit,
  restoreVisit,
  hardDeleteVisit
};
