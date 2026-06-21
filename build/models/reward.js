'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.RewardModel = void 0;
const mongoose_1 = require('mongoose');
// 2️⃣ Schema
const rewardSchema = new mongoose_1.Schema(
  {
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number },
    active: { type: Boolean, default: true, required: true },
    expiry: { type: Date },
    timesRedeemed: { type: Number, default: 0 }
  },
  { timestamps: true }
);
// 3️⃣ Model
exports.RewardModel = (0, mongoose_1.model)('Reward', rewardSchema);
//# sourceMappingURL=reward.js.map
