'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CustomerStatsModel = void 0;
const mongoose_1 = require('mongoose');
const customerStatsSchema = new mongoose_1.Schema(
  {
    customer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    totalVisits: { type: Number, default: 0 },
    totalPointsEarned: { type: Number, default: 0 },
    totalPointsSpent: { type: Number, default: 0 },
    currentPointsBalance: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageReviewRating: { type: Number, default: 0 },
    totalBadges: { type: Number, default: 0 },
    favoriteRestaurants: { type: Number, default: 0 }
  },
  { timestamps: true }
);
exports.CustomerStatsModel = (0, mongoose_1.model)('CustomerStats', customerStatsSchema);
//# sourceMappingURL=customerStats.js.map
