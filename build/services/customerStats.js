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
const customerStats_1 = require('../models/customerStats');
const customerStatsCalculator_1 = require('../utils/customerStatsCalculator');
const mongoose_1 = require('mongoose');
/**
 * Get customer statistics from database
 */
const getCustomerStatistics = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield customerStats_1.CustomerStatsModel.findOne({ customer_id }).lean();
  });
/**
 * Save or update customer statistics
 */
const saveCustomerStatistics = (customer_id, stats) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const customerId = new mongoose_1.Types.ObjectId(customer_id);
      return yield customerStats_1.CustomerStatsModel.findOneAndUpdate({ customer_id: customerId }, Object.assign(Object.assign({}, stats), { customer_id: customerId }), {
        upsert: true,
        new: true,
        runValidators: true
      });
    } catch (error) {
      throw new Error(`Failed to save customer statistics: ${error}`);
    }
  });
/**
 * Calculate and save customer statistics
 */
const calculateAndSaveCustomerStatistics = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield (0, customerStatsCalculator_1.calculateAllCustomerStats)(customer_id);
    return yield saveCustomerStatistics(customer_id, stats);
  });
exports.default = {
  getCustomerStatistics,
  saveCustomerStatistics,
  calculateAndSaveCustomerStatistics
};
//# sourceMappingURL=customerStats.js.map
