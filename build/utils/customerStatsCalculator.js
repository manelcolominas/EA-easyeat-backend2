'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.calculateAllCustomerStats = void 0;
const mongoose_1 = require('mongoose');
const visit_1 = require('../models/visit');
const pointsWallet_1 = require('../models/pointsWallet');
const review_1 = require('../models/review');
const rewardRedemption_1 = require('../models/rewardRedemption');
const customer_1 = require('../models/customer');
/**
 * Calculate total visits for a customer
 */
const calculateTotalVisits = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield visit_1.VisitModel.countDocuments({
      customer_id: customerId,
      deletedAt: null
    });
  });
/**
 * Calculate total points earned from visits
 */
const calculateTotalPointsEarned = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield visit_1.VisitModel.aggregate([
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
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
  });
/**
 * Calculate total points spent from reward redemptions
 */
const calculateTotalPointsSpent = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield rewardRedemption_1.RewardRedemptionModel.aggregate([
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
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
  });
/**
 * Calculate current points balance
 */
const calculateCurrentPointsBalance = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield pointsWallet_1.PointsWalletModel.aggregate([
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
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
  });
/**
 * Calculate total reviews
 */
const calculateTotalReviews = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield review_1.ReviewModel.countDocuments({
      customer_id: customerId,
      deleted: false
    });
  });
/**
 * Calculate average review rating
 */
const calculateAverageReviewRating = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield review_1.ReviewModel.aggregate([
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
    return Math.round((((_a = result[0]) === null || _a === void 0 ? void 0 : _a.avgRating) || 0) * 100) / 100;
  });
/**
 * Calculate total badges
 */
const calculateTotalBadges = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customer = yield customer_1.CustomerModel.findById(customerId).select('badges');
    return ((_a = customer === null || customer === void 0 ? void 0 : customer.badges) === null || _a === void 0 ? void 0 : _a.length) || 0;
  });
/**
 * Calculate favorite restaurants count
 */
const calculateFavoriteRestaurants = (customerId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customer = yield customer_1.CustomerModel.findById(customerId).select('favoriteRestaurants');
    return ((_a = customer === null || customer === void 0 ? void 0 : customer.favoriteRestaurants) === null || _a === void 0 ? void 0 : _a.length) || 0;
  });
/**
 * Calculate all customer statistics
 */
const calculateAllCustomerStats = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const customerId = new mongoose_1.Types.ObjectId(customer_id);
    const [totalVisits, totalPointsEarned, totalPointsSpent, currentPointsBalance, totalReviews, averageReviewRating, totalBadges, favoriteRestaurants] = yield Promise.all([
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
  });
exports.calculateAllCustomerStats = calculateAllCustomerStats;
exports.default = {
  calculateAllCustomerStats: exports.calculateAllCustomerStats,
  calculateTotalVisits,
  calculateTotalPointsEarned,
  calculateTotalPointsSpent,
  calculateCurrentPointsBalance,
  calculateTotalReviews,
  calculateAverageReviewRating,
  calculateTotalBadges,
  calculateFavoriteRestaurants
};
//# sourceMappingURL=customerStatsCalculator.js.map
