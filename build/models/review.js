"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const mongoose_1 = require("mongoose");
// 2️⃣ Schema
const reviewSchema = new mongoose_1.Schema({
    employee_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', default: null },
    customer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    date: { type: Date, required: true, default: Date.now },
    globalRating: { type: Number, required: true, min: 0, max: 10 },
    images: [{ type: String }],
    ratings: {
        foodQuality: { type: Number, min: 0, max: 10 },
        staffService: { type: Number, min: 0, max: 10 },
        cleanliness: { type: Number, min: 0, max: 10 },
        environment: { type: Number, min: 0, max: 10 }
    },
    comment: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    // 🔥 SOFT DELETE
    deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});
// Evitar duplicados SOLO si no está eliminado
reviewSchema.index({ customer_id: 1, restaurant_id: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
// Para búsquedas rápidas (paginación/filtros)
reviewSchema.index({ customer_id: 1, deleted: 1 });
reviewSchema.index({ restaurant_id: 1, deleted: 1 });
reviewSchema.index({ employee_id: 1, deleted: 1 });
reviewSchema.index({ globalRating: -1 });
reviewSchema.index({ likes: -1 });
// 3️⃣ Model
exports.ReviewModel = (0, mongoose_1.model)('Review', reviewSchema);
//# sourceMappingURL=review.js.map