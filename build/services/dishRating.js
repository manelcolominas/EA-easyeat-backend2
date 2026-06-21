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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const mongoose_1 = __importDefault(require('mongoose'));
const dishRating_1 = require('../models/dishRating');
const dish_1 = require('../models/dish');
// ─── Create or Update ─────────────────────────────────────────────────────────
/**
 * Creates a new dish rating or updates the customer's existing active rating.
 * Returns null when the dish is not found or is inactive.
 */
const rateOrUpdateDish = (customer_id, dish_id, rating) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const dish = yield dish_1.DishModel.findOne({ _id: dish_id, active: true });
    if (!dish) return null;
    const restaurant_id = dish.restaurant_id;
    const customerId = new mongoose_1.default.Types.ObjectId(customer_id);
    const dishId = new mongoose_1.default.Types.ObjectId(dish_id);
    // Check for an existing active rating to decide create vs update
    const existing = yield dishRating_1.DishRatingModel.findOne({ customer_id: customerId, dish_id: dishId, deletedAt: null });
    if (existing) {
      existing.rating = rating;
      const updated = yield existing.save();
      return { data: updated, isNew: false };
    }
    const dishRating = new dishRating_1.DishRatingModel({
      _id: new mongoose_1.default.Types.ObjectId(),
      customer_id: customerId,
      dish_id: dishId,
      restaurant_id,
      rating,
      deletedAt: null
    });
    const created = yield dishRating.save();
    return { data: created, isNew: true };
  });
// ─── Read ratings for a dish ─────────────────────────────────────────────────
const getRatingsByDish = (dish_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [dishRatings, total] = yield Promise.all([
      dishRating_1.DishRatingModel.find({ dish_id: dish_id }).skip(skip).limit(limit).lean(),
      dishRating_1.DishRatingModel.countDocuments({ dish_id: dish_id })
    ]);
    return { dishRatings, total };
  });
// ─── Read ratings for a customer ─────────────────────────────────────────────
const getRatingsByCustomer = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { customer_id: new mongoose_1.default.Types.ObjectId(customer_id), deletedAt: null };
    const [dishRatings, total] = yield Promise.all([
      dishRating_1.DishRatingModel.find(filter).sort({ createdAt: -1 }).populate('dish_id', 'name section price').lean().skip(skip).limit(limit),
      dishRating_1.DishRatingModel.countDocuments(filter)
    ]);
    return { dishRatings, total };
  });
// ─── Soft Delete ──────────────────────────────────────────────────────────────
/**
 * Soft-deletes a rating by setting deletedAt.
 * When customer_id is provided, only that customer's rating can be deleted
 * (used to enforce ownership; admins omit customer_id to bypass).
 */
const softDeleteRating = (rating_id, customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(rating_id)) return null;
    const filter = { _id: rating_id, deletedAt: null };
    if (customer_id) filter.customer_id = new mongoose_1.default.Types.ObjectId(customer_id);
    return dishRating_1.DishRatingModel.findOneAndUpdate(filter, { deletedAt: new Date() }, { new: true }).lean();
  });
// ─── Rating summary (aggregation) ────────────────────────────────────────────
const getDishRatingSummary = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [
      { $match: { dish_id: new mongoose_1.default.Types.ObjectId(dish_id), deletedAt: null } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ];
    const [result] = yield dishRating_1.DishRatingModel.aggregate(pipeline);
    return {
      avgRating: Math.round(result.avgRating * 10) / 10
    };
  });
const getTopDishByRestaurant = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(restaurant_id)) return null;
    const pipeline = [
      {
        $match: {
          restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id),
          deletedAt: null
        }
      },
      {
        $group: {
          _id: '$dish_id',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      },
      {
        $sort: { averageRating: -1 }
      },
      {
        $limit: 1
      }
    ];
    const [topDish] = yield dishRating_1.DishRatingModel.aggregate(pipeline);
    if (!topDish) return null;
    const dish = yield dish_1.DishModel.findOne({ _id: topDish._id, active: true });
    if (!dish) return null;
    return {
      name: dish.name,
      averageRating: Math.round(topDish.averageRating * 10) / 10,
      totalRatings: topDish.totalRatings
    };
  });
const getTopDishesByRestaurant = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(restaurant_id)) return [];
    const pipeline = [
      {
        $match: {
          restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id),
          deletedAt: null
        }
      },
      {
        $group: {
          _id: '$dish_id',
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { avgRating: -1 }
      },
      {
        $lookup: {
          from: 'dishes',
          localField: '_id',
          foreignField: '_id',
          as: 'dish'
        }
      },
      {
        $unwind: '$dish'
      },
      {
        $match: { 'dish.active': true }
      },
      {
        $project: {
          _id: 0,
          dish_id: { $toString: '$_id' },
          name: '$dish.name',
          avgRating: { $round: ['$avgRating', 1] }
        }
      }
    ];
    return dishRating_1.DishRatingModel.aggregate(pipeline);
  });
// ─── Exports ──────────────────────────────────────────────────────────────────
exports.default = {
  rateOrUpdateDish,
  getRatingsByDish,
  getRatingsByCustomer,
  softDeleteRating,
  getDishRatingSummary,
  getTopDishByRestaurant,
  getTopDishesByRestaurant
};
//# sourceMappingURL=dishRating.js.map
