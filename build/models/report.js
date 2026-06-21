'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ReportModel = void 0;
const mongoose_1 = require('mongoose');
// Schema
const reportSchema = new mongoose_1.Schema(
  {
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 500
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);
// Model
exports.ReportModel = (0, mongoose_1.model)('Report', reportSchema);
//# sourceMappingURL=report.js.map
