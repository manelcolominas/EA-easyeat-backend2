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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const employeeStats_1 = __importDefault(require('../services/employeeStats'));
const getEmployeeStatistics = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { employee_id } = req.params;
    try {
      // Try to get existing stats
      let employeeStats = yield employeeStats_1.default.getEmployeeStatistics(employee_id);
      // If stats don't exist, calculate and save them
      if (!employeeStats) {
        employeeStats = yield employeeStats_1.default.calculateAndSaveEmployeeStatistics(employee_id);
      }
      return res.status(200).json(employeeStats);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
const calculateAndSaveEmployeeStatistics = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { employee_id } = req.params;
    try {
      const stats = yield employeeStats_1.default.calculateAndSaveEmployeeStatistics(employee_id);
      return res.status(200).json({
        message: 'Employee statistics calculated and saved successfully',
        data: stats
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
const recalculateEmployeeStatistics = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { employee_id } = req.params;
    try {
      const stats = yield employeeStats_1.default.calculateAndSaveEmployeeStatistics(employee_id);
      return res.status(200).json({
        message: 'Employee statistics recalculated successfully',
        data: stats
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
exports.default = {
  getEmployeeStatistics,
  calculateAndSaveEmployeeStatistics,
  recalculateEmployeeStatistics
};
//# sourceMappingURL=employeeStats.js.map
