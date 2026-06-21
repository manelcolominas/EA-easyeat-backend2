"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsWalletModel = void 0;
const mongoose_1 = require("mongoose");
const pointsWalletSchema = new mongoose_1.Schema({
    customer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    points: { type: Number, required: true, default: 0, min: [0, 'Points cannot be negative'] }
}, { timestamps: true });
pointsWalletSchema.index({ customer_id: 1, restaurant_id: 1 }, { unique: true });
pointsWalletSchema.index({ customer_id: 1 });
exports.PointsWalletModel = (0, mongoose_1.model)('PointsWallet', pointsWalletSchema);
//# sourceMappingURL=pointsWallet.js.map