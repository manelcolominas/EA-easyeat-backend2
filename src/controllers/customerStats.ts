import { NextFunction, Request, Response } from 'express';
import CustomerStatsService from '../services/customerStats';

const getCustomerStatistics = async (req: Request, res: Response, next: NextFunction) => {
  const { customer_id } = req.params;
  try {
    // Try to get existing stats
    let customerStats = await CustomerStatsService.getCustomerStatistics(customer_id);

    // If stats don't exist, calculate and save them
    if (!customerStats) {
      customerStats = await CustomerStatsService.calculateAndSaveCustomerStatistics(customer_id);
    }

    return res.status(200).json(customerStats);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const calculateAndSaveCustomerStatistics = async (req: Request, res: Response, next: NextFunction) => {
  const { customer_id } = req.params;
  try {
    const stats = await CustomerStatsService.calculateAndSaveCustomerStatistics(customer_id);
    return res.status(200).json({
      message: 'Customer statistics calculated and saved successfully',
      data: stats
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const recalculateCustomerStatistics = async (req: Request, res: Response, next: NextFunction) => {
  const { customer_id } = req.params;
  try {
    const stats = await CustomerStatsService.calculateAndSaveCustomerStatistics(customer_id);
    return res.status(200).json({
      message: 'Customer statistics recalculated successfully',
      data: stats
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export default {
  getCustomerStatistics,
  calculateAndSaveCustomerStatistics,
  recalculateCustomerStatistics
};
