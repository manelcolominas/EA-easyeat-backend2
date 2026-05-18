import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import StatisticsService from '../services/statistics';
import { VisitModel } from '../models/visit';
import { getPaginationOptions } from '../utils/pagination';

const getRestaurantObjectId = (req: Request): mongoose.Types.ObjectId | null => {
  const restaurantId = (req.query.restaurant_id || req.params.restaurant_id) as string | undefined;

  if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
    return null;
  }

  return new mongoose.Types.ObjectId(restaurantId);
};

const buildVisitMatch = (restaurantId: mongoose.Types.ObjectId) => ({
  restaurant_id: restaurantId,
  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
});

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
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { statistics, total } = await StatisticsService.getAllStatistics(skip, limit);
    return res.status(200).json({
      data: statistics,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const readByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  const { restaurant_id } = req.params;
  try {
    const statistics = await StatisticsService.getByRestaurant(restaurant_id);
    return statistics ? res.status(200).json(statistics) : res.status(404).json({ message: 'not found' });
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

const visitsPerHour = async (req: Request, res: Response, next: NextFunction) => {
  const restaurantObjectId = getRestaurantObjectId(req);

  if (!restaurantObjectId) {
    return res.status(400).json({ message: 'restaurant_id query param is required and must be a valid ObjectId' });
  }

  try {
    const data = await VisitModel.aggregate<{ hour: number; visits: number }>([
      { $match: buildVisitMatch(restaurantObjectId) },
      {
        $group: {
          _id: { $hour: '$date' },
          visits: { $sum: 1 }
        }
      },
      { $project: { _id: 0, hour: '$_id', visits: 1 } },
      { $sort: { hour: 1 } }
    ]);

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const averagePoints = async (req: Request, res: Response, next: NextFunction) => {
  const restaurantObjectId = getRestaurantObjectId(req);

  if (!restaurantObjectId) {
    return res.status(400).json({ message: 'restaurant_id query param is required and must be a valid ObjectId' });
  }

  try {
    const [result] = await VisitModel.aggregate<{ averagePoints: number; totalVisits: number }>([
      { $match: buildVisitMatch(restaurantObjectId) },
      {
        $group: {
          _id: null,
          averagePoints: { $avg: '$pointsEarned' },
          totalVisits: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          averagePoints: { $ifNull: ['$averagePoints', 0] },
          totalVisits: 1
        }
      }
    ]);

    return res.status(200).json({
      data: {
        averagePoints: result?.averagePoints ?? 0,
        totalVisits: result?.totalVisits ?? 0
      }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const loyalCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const restaurantObjectId = getRestaurantObjectId(req);
  const minVisits = Number.parseInt((req.query.minVisits as string) || '3', 10);

  if (!restaurantObjectId) {
    return res.status(400).json({ message: 'restaurant_id query param is required and must be a valid ObjectId' });
  }

  if (!Number.isFinite(minVisits) || minVisits < 1) {
    return res.status(400).json({ message: 'minVisits must be an integer greater than 0' });
  }

  try {
    const [result] = await VisitModel.aggregate<{ loyalCustomers: number }>([
      { $match: buildVisitMatch(restaurantObjectId) },
      {
        $group: {
          _id: '$customer_id',
          visits: { $sum: 1 }
        }
      },
      { $match: { visits: { $gt: minVisits } } },
      {
        $group: {
          _id: null,
          loyalCustomers: { $sum: 1 }
        }
      },
      { $project: { _id: 0, loyalCustomers: 1 } }
    ]);

    return res.status(200).json({
      data: {
        loyalCustomers: result?.loyalCustomers ?? 0,
        minVisits
      }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export default {
  createStatistics,
  readStatistics,
  readAll,
  readByRestaurant,
  updateStatistics,
  deleteStatistics,
  visitsPerHour,
  averagePoints,
  loyalCustomers
};
