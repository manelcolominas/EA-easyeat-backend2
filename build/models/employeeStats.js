'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EmployeeStatsModel = void 0;
const mongoose_1 = require('mongoose');
const employeeStatsSchema = new mongoose_1.Schema(
  {
    employee_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true },
    totalVisitsHandled: { type: Number, default: 0 },
    totalCustomersServed: { type: Number, default: 0 },
    totalRevenueGenerated: { type: Number, default: 0 },
    totalRewardApprovalsRejections: { type: Number, default: 0 },
    totalRewardApprovalsApproved: { type: Number, default: 0 },
    totalRewardApprovalsRejected: { type: Number, default: 0 },
    averageRewardApprovalTime: { type: Number, default: 0 }
  },
  { timestamps: true }
);
employeeStatsSchema.index({ employee_id: 1 }, { unique: true });
exports.EmployeeStatsModel = (0, mongoose_1.model)('EmployeeStats', employeeStatsSchema);
//# sourceMappingURL=employeeStats.js.map
