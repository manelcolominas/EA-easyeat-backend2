import { Types } from 'mongoose';
import { VisitModel } from '../models/visit';
import { PointsWalletModel } from '../models/pointsWallet';
import { ReviewModel } from '../models/review';
import { RewardRedemptionModel } from '../models/rewardRedemption';
import { CustomerModel } from '../models/customer';
import { ICustomerStats } from '../models/customerStats';

/**
 * Calculate total visits for a customer
 */
const calculateTotalVisits = async (customerId: Types.ObjectId): Promise<number> => {
  return await VisitModel.countDocuments({
    customer_id: customerId,
    deletedAt: null
  });
};

/**
 * Calculate total points earned from visits
 */
const calculateTotalPointsEarned = async (customerId: Types.ObjectId): Promise<number> => {
  const result = await VisitModel.aggregate([
    {
      $match: {
        customer_id: customerId,
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$pointsEarned' }
      }
    }
  ]);
  return result[0]?.total || 0;
};

/**
 * Calculate total points spent from reward redemptions
 */
const calculateTotalPointsSpent = async (customerId: Types.ObjectId): Promise<number> => {
  const result = await RewardRedemptionModel.aggregate([
    {
      $match: {
        customer_id: customerId,
        status: { $in: ['redeemed', 'approved'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$pointsUsed' }
      }
    }
  ]);
  return result[0]?.total || 0;
};

/**
 * Calculate current points balance
 */
const calculateCurrentPointsBalance = async (customerId: Types.ObjectId): Promise<number> => {
  const result = await PointsWalletModel.aggregate([
    {
      $match: { customer_id: customerId }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$points' }
      }
    }
  ]);
  return result[0]?.total || 0;
};

/**
 * Calculate total reviews
 */
const calculateTotalReviews = async (customerId: Types.ObjectId): Promise<number> => {
  return await ReviewModel.countDocuments({
    customer_id: customerId,
    deleted: false
  });
};

/**
 * Calculate average review rating
 */
const calculateAverageReviewRating = async (customerId: Types.ObjectId): Promise<number> => {
  const result = await ReviewModel.aggregate([
    {
      $match: {
        customer_id: customerId,
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
 * Calculate total badges
 */
const calculateTotalBadges = async (customerId: Types.ObjectId): Promise<number> => {
  const customer = await CustomerModel.findById(customerId).select('badges');
  return customer?.badges?.length || 0;
};

/**
 * Calculate favorite restaurants count
 */
const calculateFavoriteRestaurants = async (customerId: Types.ObjectId): Promise<number> => {
  const customer = await CustomerModel.findById(customerId).select('favoriteRestaurants');
  return customer?.favoriteRestaurants?.length || 0;
};

/**
 * Calculate all customer statistics
 */
export const calculateAllCustomerStats = async (customer_id: string): Promise<ICustomerStats> => {
  const customerId = new Types.ObjectId(customer_id);

  const [totalVisits, totalPointsEarned, totalPointsSpent, currentPointsBalance, totalReviews, averageReviewRating, totalBadges, favoriteRestaurants] = await Promise.all([
    calculateTotalVisits(customerId),
    calculateTotalPointsEarned(customerId),
    calculateTotalPointsSpent(customerId),
    calculateCurrentPointsBalance(customerId),
    calculateTotalReviews(customerId),
    calculateAverageReviewRating(customerId),
    calculateTotalBadges(customerId),
    calculateFavoriteRestaurants(customerId)
  ]);

  return {
    customer_id: customerId,
    totalVisits,
    totalPointsEarned,
    totalPointsSpent,
    currentPointsBalance,
    totalReviews,
    averageReviewRating,
    totalBadges,
    favoriteRestaurants
  };
};

export default {
  calculateAllCustomerStats,
  calculateTotalVisits,
  calculateTotalPointsEarned,
  calculateTotalPointsSpent,
  calculateCurrentPointsBalance,
  calculateTotalReviews,
  calculateAverageReviewRating,
  calculateTotalBadges,
  calculateFavoriteRestaurants
};
