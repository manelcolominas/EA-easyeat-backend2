'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CustomerDeviceTokenModel = void 0;
const mongoose_1 = require('mongoose');
const customerDeviceTokenSchema = new mongoose_1.Schema(
  {
    customer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    platform: { type: String, enum: ['android', 'ios', 'web'], default: 'web' },
    active: { type: Boolean, default: true, index: true },
    lastSeenAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);
customerDeviceTokenSchema.index({ customer_id: 1, active: 1, deletedAt: 1 });
exports.CustomerDeviceTokenModel = (0, mongoose_1.model)('CustomerDeviceToken', customerDeviceTokenSchema);
//# sourceMappingURL=customerDeviceToken.js.map
