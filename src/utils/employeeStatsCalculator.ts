import { Types } from 'mongoose';
import { VisitModel } from '../models/visit';
import { ReviewModel } from '../models/review';
import { RewardRedemptionModel } from '../models/rewardRedemption';
import { IEmployeeStats } from '../models/employeeStats';

/**
 * Calculate total visits handled by employee
 */
const calculateTotalVisitsHandled = async (employeeId: Types.ObjectId): Promise<number> => {
  return await VisitModel.countDocuments({
    employee_id: employeeId,
    deletedAt: null
  });
};

/**
 * Calculate unique customers served
 */
const calculateTotalCustomersServed = async (employeeId: Types.ObjectId): Promise<number> => {
  const result = await VisitModel.aggregate([
    {
      $match: {
        employee_id: employeeId,
        deletedAt: null
      }
    },
    {
      $group: {
        _id: '$customer_id'
      }
    },
    {
      $count: 'uniqueCustomers'
    }
  ]);
  return result[0]?.uniqueCustomers || 0;
};

/**
 * Calculate total revenue generated from visits
 */
const calculateTotalRevenueGenerated = async (employeeId: Types.ObjectId): Promise<number> => {
  const result = await VisitModel.aggregate([
    {
      $match: {
        employee_id: employeeId,
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$billAmount' }
      }
    }
  ]);
  return result[0]?.total || 0;
};

/**
 * Calculate average customer rating from reviews mentioning this employee
 */
const calculateAverageCustomerRating = async (employeeId: Types.ObjectId): Promise<number> => {
  const result = await ReviewModel.aggregate([
    {
      $match: {
        employee_id: employeeId,
        deleted: false
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$globalRating' }
      }
    }
  ]);
  return Math.round((result[0]?.avgRating || 0) * 100) / 100;
};

/**
 * Calculate total reviews involving this employee
 */
const calculateTotalReviews = async (employeeId: Types.ObjectId): Promise<number> => {
  return await ReviewModel.countDocuments({
    employee_id: employeeId,
    deleted: false
  });
};

/**
 * Calculate total reward redemptions handled
 */
const calculateTotalRewardApprovalsRejections = async (employeeId: Types.ObjectId): Promise<number> => {
  return await RewardRedemptionModel.countDocuments({
    employee_id: employeeId,
    status: { $in: ['approved', 'redeemed', 'cancelled', 'expired'] }
  });
};

/**
 * Calculate total approved reward redemptions
 */
const calculateTotalRewardApprovalsApproved = async (employeeId: Types.ObjectId): Promise<number> => {
  return await RewardRedemptionModel.countDocuments({
    employee_id: employeeId,
    status: 'approved'
  });
};

/**
 * Calculate total rejected/cancelled reward redemptions
 */
const calculateTotalRewardApprovalsRejected = async (employeeId: Types.ObjectId): Promise<number> => {
  return await RewardRedemptionModel.countDocuments({
    employee_id: employeeId,
    status: { $in: ['cancelled', 'expired'] }
  });
};

/**
 * Calculate average reward approval time in minutes
 */
const calculateAverageRewardApprovalTime = async (employeeId: Types.ObjectId): Promise<number> => {
  const result = await RewardRedemptionModel.aggregate([
    {
      $match: {
        employee_id: employeeId,
        status: { $in: ['approved', 'redeemed'] },
        redeemedAt: { $ne: null }
      }
    },
    {
      $addFields: {
        approvalTimeMs: {
          $subtract: ['$redeemedAt', '$createdAt']
        }
      }
    },
    {
      $group: {
        _id: null,
        avgTimeMs: { $avg: '$approvalTimeMs' }
      }
    }
  ]);

  // Convert milliseconds to minutes and round
  const avgTimeMs = result[0]?.avgTimeMs || 0;
  return Math.round((avgTimeMs / 60000) * 100) / 100;
};

/**
 * Calculate all employee statistics
 */
export const calculateAllEmployeeStats = async (employee_id: string): Promise<IEmployeeStats> => {
  const employeeId = new Types.ObjectId(employee_id);

  const [
    totalVisitsHandled,
    totalCustomersServed,
    totalRevenueGenerated,
    averageCustomerRating,
    totalReviews,
    totalRewardApprovalsRejections,
    totalRewardApprovalsApproved,
    totalRewardApprovalsRejected,
    averageRewardApprovalTime
  ] = await Promise.all([
    calculateTotalVisitsHandled(employeeId),
    calculateTotalCustomersServed(employeeId),
    calculateTotalRevenueGenerated(employeeId),
    calculateAverageCustomerRating(employeeId),
    calculateTotalReviews(employeeId),
    calculateTotalRewardApprovalsRejections(employeeId),
    calculateTotalRewardApprovalsApproved(employeeId),
    calculateTotalRewardApprovalsRejected(employeeId),
    calculateAverageRewardApprovalTime(employeeId)
  ]);

  return {
    employee_id: employeeId,
    totalVisitsHandled,
    totalCustomersServed,
    totalRevenueGenerated,
    totalRewardApprovalsRejections,
    totalRewardApprovalsApproved,
    totalRewardApprovalsRejected,
    averageRewardApprovalTime
  };
};

export default {
  calculateAllEmployeeStats,
  calculateTotalVisitsHandled,
  calculateTotalCustomersServed,
  calculateTotalRevenueGenerated,
  calculateAverageCustomerRating,
  calculateTotalReviews,
  calculateTotalRewardApprovalsRejections,
  calculateTotalRewardApprovalsApproved,
  calculateTotalRewardApprovalsRejected,
  calculateAverageRewardApprovalTime
};
