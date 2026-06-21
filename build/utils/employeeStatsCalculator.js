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
exports.calculateAllEmployeeStats = void 0;
const mongoose_1 = require('mongoose');
const visit_1 = require('../models/visit');
const review_1 = require('../models/review');
const rewardRedemption_1 = require('../models/rewardRedemption');
/**
 * Calculate total visits handled by employee
 */
const calculateTotalVisitsHandled = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield visit_1.VisitModel.countDocuments({
      employee_id: employeeId,
      deletedAt: null
    });
  });
/**
 * Calculate unique customers served
 */
const calculateTotalCustomersServed = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield visit_1.VisitModel.aggregate([
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
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.uniqueCustomers) || 0;
  });
/**
 * Calculate total revenue generated from visits
 */
const calculateTotalRevenueGenerated = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield visit_1.VisitModel.aggregate([
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
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
  });
/**
 * Calculate average customer rating from reviews mentioning this employee
 */
const calculateAverageCustomerRating = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield review_1.ReviewModel.aggregate([
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
    return Math.round((((_a = result[0]) === null || _a === void 0 ? void 0 : _a.avgRating) || 0) * 100) / 100;
  });
/**
 * Calculate total reviews involving this employee
 */
const calculateTotalReviews = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield review_1.ReviewModel.countDocuments({
      employee_id: employeeId,
      deleted: false
    });
  });
/**
 * Calculate total reward redemptions handled
 */
const calculateTotalRewardApprovalsRejections = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield rewardRedemption_1.RewardRedemptionModel.countDocuments({
      employee_id: employeeId,
      status: { $in: ['approved', 'redeemed', 'cancelled', 'expired'] }
    });
  });
/**
 * Calculate total approved reward redemptions
 */
const calculateTotalRewardApprovalsApproved = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield rewardRedemption_1.RewardRedemptionModel.countDocuments({
      employee_id: employeeId,
      status: 'approved'
    });
  });
/**
 * Calculate total rejected/cancelled reward redemptions
 */
const calculateTotalRewardApprovalsRejected = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield rewardRedemption_1.RewardRedemptionModel.countDocuments({
      employee_id: employeeId,
      status: { $in: ['cancelled', 'expired'] }
    });
  });
/**
 * Calculate average reward approval time in minutes
 */
const calculateAverageRewardApprovalTime = (employeeId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield rewardRedemption_1.RewardRedemptionModel.aggregate([
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
    const avgTimeMs = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.avgTimeMs) || 0;
    return Math.round((avgTimeMs / 60000) * 100) / 100;
  });
/**
 * Calculate all employee statistics
 */
const calculateAllEmployeeStats = (employee_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const employeeId = new mongoose_1.Types.ObjectId(employee_id);
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
    ] = yield Promise.all([
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
  });
exports.calculateAllEmployeeStats = calculateAllEmployeeStats;
exports.default = {
  calculateAllEmployeeStats: exports.calculateAllEmployeeStats,
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
//# sourceMappingURL=employeeStatsCalculator.js.map
