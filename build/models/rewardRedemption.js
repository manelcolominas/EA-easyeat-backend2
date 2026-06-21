"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardRedemptionModel = void 0;
const mongoose_1 = require("mongoose");
const rewardRedemptionSchema = new mongoose_1.Schema({
    customer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    reward_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Reward', required: true },
    employee_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', default: null },
    pointsUsed: {
        type: Number,
        required: true,
        min: [0, 'Points used cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'redeemed', 'cancelled', 'expired'],
        default: 'pending'
    },
    redeemedAt: {
        type: Date,
        default: null
    },
    notes: { type: String, trim: true }
}, { timestamps: true });
exports.RewardRedemptionModel = (0, mongoose_1.model)('RewardRedemption', rewardRedemptionSchema);
//# sourceMappingURL=rewardRedemption.js.map