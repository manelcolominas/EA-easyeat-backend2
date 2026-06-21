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
const employeeStats_1 = require('../models/employeeStats');
const employeeStatsCalculator_1 = require('../utils/employeeStatsCalculator');
const mongoose_1 = require('mongoose');
/**
 * Get employee statistics from database
 */
const getEmployeeStatistics = (employee_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield employeeStats_1.EmployeeStatsModel.findOne({ employee_id }).lean();
  });
/**
 * Save or update employee statistics
 */
const saveEmployeeStatistics = (employee_id, stats) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employeeId = new mongoose_1.Types.ObjectId(employee_id);
      return yield employeeStats_1.EmployeeStatsModel.findOneAndUpdate({ employee_id: employeeId }, Object.assign(Object.assign({}, stats), { employee_id: employeeId }), {
        upsert: true,
        new: true,
        runValidators: true
      });
    } catch (error) {
      throw new Error(`Failed to save employee statistics: ${error}`);
    }
  });
/**
 * Calculate and save employee statistics
 */
const calculateAndSaveEmployeeStatistics = (employee_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield (0, employeeStatsCalculator_1.calculateAllEmployeeStats)(employee_id);
    return yield saveEmployeeStatistics(employee_id, stats);
  });
exports.default = {
  getEmployeeStatistics,
  saveEmployeeStatistics,
  calculateAndSaveEmployeeStatistics
};
//# sourceMappingURL=employeeStats.js.map
