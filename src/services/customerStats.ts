import { CustomerStatsModel } from '../models/customerStats';
import { calculateAllCustomerStats } from '../utils/customerStatsCalculator';
import { ICustomerStats } from '../models/customerStats';
import { Types } from 'mongoose';

/**
 * Get customer statistics from database
 */
const getCustomerStatistics = async (customer_id: string) => {
  return await CustomerStatsModel.findOne({ customer_id }).lean();
};

/**
 * Save or update customer statistics
 */
const saveCustomerStatistics = async (customer_id: string, stats: Partial<ICustomerStats>) => {
  try {
    const customerId = new Types.ObjectId(customer_id);
    return await CustomerStatsModel.findOneAndUpdate({ customer_id: customerId }, { ...stats, customer_id: customerId }, { upsert: true, new: true, runValidators: true });
  } catch (error) {
    throw new Error(`Failed to save customer statistics: ${error}`);
  }
};

/**
 * Calculate and save customer statistics
 */
const calculateAndSaveCustomerStatistics = async (customer_id: string) => {
  const stats = await calculateAllCustomerStats(customer_id);
  return await saveCustomerStatistics(customer_id, stats);
};

export default {
  getCustomerStatistics,
  saveCustomerStatistics,
  calculateAndSaveCustomerStatistics
};
