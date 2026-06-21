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
const report_1 = __importDefault(require('../services/report'));
const pagination_1 = require('../utils/pagination');
const createReport = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
      const restaurantId = req.params.restaurantId;
      const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
      const reason = req.body.reason;
      const reportData = {
        restaurantId,
        userId,
        reason
      };
      const savedReport = yield report_1.default.createReport(reportData);
      return res.status(201).json(savedReport);
    } catch (error) {
      return next(error);
    }
  });
const updateReport = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const updated = yield report_1.default.updateReport(req.params.reportId, req.body);
      return updated ? res.status(200).json({ message: 'Report updated successfully', data: updated }) : res.status(404).json({ message: 'Report not found' });
    } catch (error) {
      return next(error);
    }
  });
const readAllReports = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { reports, total } = yield report_1.default.getAllReports(skip, limit);
      return res.status(200).json({
        data: reports,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const deleteReport = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const deleted = yield report_1.default.deleteReport(req.params.reportId);
      return deleted ? res.status(200).json(deleted) : res.status(404).json({ message: 'Report not found' });
    } catch (error) {
      return next(error);
    }
  });
exports.default = {
  createReport,
  readAllReports,
  updateReport,
  deleteReport
};
//# sourceMappingURL=report.js.map
