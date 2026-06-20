"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeModel = void 0;
const mongoose_1 = require("mongoose");
// Schema
const badgeSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });
// Model
exports.BadgeModel = (0, mongoose_1.model)('Badge', badgeSchema);
//# sourceMappingURL=badge.js.map