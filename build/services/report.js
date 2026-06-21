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
const report_1 = require('../models/report');
const createReport = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const report = new report_1.ReportModel(Object.assign({}, data));
    return yield report.save();
  });
const updateReport = (reportId, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const report = yield report_1.ReportModel.findById(reportId);
    if (report) {
      report.set(data);
      return yield report.save();
    }
    return null;
  });
const getAllReports = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [reports, total] = yield Promise.all([
      report_1.ReportModel.find().populate('restaurantId', 'profile.name').populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      report_1.ReportModel.countDocuments()
    ]);
    return { reports, total };
  });
const deleteReport = (reportId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield report_1.ReportModel.findByIdAndDelete(reportId);
  });
exports.default = { createReport, getAllReports, updateReport, deleteReport };
//# sourceMappingURL=report.js.map
