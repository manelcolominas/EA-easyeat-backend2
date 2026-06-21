'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.DishRatingModel = void 0;
const mongoose_1 = require('mongoose');
// ─── Schema ───────────────────────────────────────────────────────────────────
const dishRatingSchema = new mongoose_1.Schema(
  {
    customer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    dish_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Dish', required: true },
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    rating: {
      type: Number,
      required: true,
      min: [0, 'Rating cannot be below 0'],
      max: [10, 'Rating cannot exceed 10']
    },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true }
);
// ─── Indexes ──────────────────────────────────────────────────────────────────
// One active rating per customer+dish (soft-deleted duplicates are allowed)
dishRatingSchema.index(
  { customer_id: 1, dish_id: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
    name: 'unique_active_customer_dish'
  }
);
dishRatingSchema.statics.calculateAvgRating = function (dishId) {
  return __awaiter(this, void 0, void 0, function* () {
    const stats = yield this.aggregate([
      {
        $match: { dish_id: dishId, deletedAt: null }
      },
      {
        $group: {
          _id: '$dish_id',
          avgRating: { $avg: '$rating' },
          ratingsCount: { $sum: 1 }
        }
      }
    ]);
    if (stats.length > 0) {
      yield (0, mongoose_1.model)('Dish').findByIdAndUpdate(dishId, {
        avgRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
        ratingsCount: stats[0].ratingsCount
      });
    } else {
      yield (0, mongoose_1.model)('Dish').findByIdAndUpdate(dishId, {
        avgRating: 0,
        ratingsCount: 0
      });
    }
  });
};
// Post-save hook (handles creation and updates)
dishRatingSchema.post('save', function () {
  return __awaiter(this, void 0, void 0, function* () {
    // 'this' refers to the document being saved
    yield this.constructor.calculateAvgRating(this.dish_id);
  });
});
// If you use findOneAndUpdate for soft deletes, add a post hook for that too
dishRatingSchema.post(/^findOneAnd/, function (doc) {
  return __awaiter(this, void 0, void 0, function* () {
    if (doc) {
      yield doc.constructor.calculateAvgRating(doc.dish_id);
    }
  });
});
// Fast lookup by dish (listing + analytics)
dishRatingSchema.index({ dish_id: 1, deletedAt: 1, createdAt: -1 });
// Fast lookup by customer (profile page)
dishRatingSchema.index({ customer_id: 1, deletedAt: 1, createdAt: -1 });
// Fast lookup by restaurant (future analytics)
dishRatingSchema.index({ restaurant_id: 1, deletedAt: 1, createdAt: -1 });
// ─── Model ────────────────────────────────────────────────────────────────────
exports.DishRatingModel = (0, mongoose_1.model)('DishRating', dishRatingSchema);
//# sourceMappingURL=dishRating.js.map
