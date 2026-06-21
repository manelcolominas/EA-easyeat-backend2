'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.StatisticsModel = void 0;
const mongoose_1 = require('mongoose');
// Schema
const statisticsSchema = new mongoose_1.Schema(
  {
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, unique: true, index: true },
    totalPointsGiven: { type: Number, default: 0 },
    loyalCustomers: { type: Number, default: 0 },
    mostRequestedRewards: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Reward' }],
    averagePointsPerVisit: { type: Number, default: 0 }
  },
  { timestamps: true }
);
// Model
exports.StatisticsModel = (0, mongoose_1.model)('Statistics', statisticsSchema);
//# sourceMappingURL=statistics.js.map
