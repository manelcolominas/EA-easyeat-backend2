import { EmployeeStatsModel } from '../models/employeeStats';
import { calculateAllEmployeeStats } from '../utils/employeeStatsCalculator';
import { IEmployeeStats } from '../models/employeeStats';
import { Types } from 'mongoose';

/**
 * Get employee statistics from database
 */
const getEmployeeStatistics = async (employee_id: string): Promise<IEmployeeStats | null> => {
  return await EmployeeStatsModel.findOne({ employee_id }).lean();
};

/**
 * Save or update employee statistics
 */
const saveEmployeeStatistics = async (employee_id: string, stats: Partial<IEmployeeStats>): Promise<IEmployeeStats | null> => {
  try {
    const employeeId = new Types.ObjectId(employee_id);
    return await EmployeeStatsModel.findOneAndUpdate({ employee_id: employeeId }, { ...stats, employee_id: employeeId }, { upsert: true, new: true, runValidators: true });
  } catch (error) {
    const wrappedError = new Error('Failed to save customer statistics') as Error & {
      cause?: unknown;
    };

    wrappedError.cause = error;
    throw wrappedError;
  }
};

/**
 * Calculate and save employee statistics
 */
const calculateAndSaveEmployeeStatistics = async (employee_id: string): Promise<IEmployeeStats | null> => {
  const stats = await calculateAllEmployeeStats(employee_id);
  return await saveEmployeeStatistics(employee_id, stats);
};

export default {
  getEmployeeStatistics,
  saveEmployeeStatistics,
  calculateAndSaveEmployeeStatistics
};
