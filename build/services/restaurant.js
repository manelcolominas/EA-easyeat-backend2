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
const restaurant_1 = require('../models/restaurant');
const dishRating_1 = require('../models/dishRating');
const customer_1 = require('../models/customer');
const badge_1 = require('../models/badge');
const dish_1 = require('../models/dish');
const employee_1 = require('../models/employee');
const reward_1 = require('../models/reward');
const review_1 = require('../models/review');
const statistics_1 = require('../models/statistics');
const visit_1 = require('../models/visit');
// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────
const createRestaurant = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = new restaurant_1.RestaurantModel(data);
    return restaurant.save();
  });
const getRestaurantGlobalRating = (restaurantId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    console.log('restaurantId:', restaurantId);
    const restaurantIdCandidates = [restaurantId];
    if (mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
      restaurantIdCandidates.unshift(new mongoose_1.default.Types.ObjectId(restaurantId));
    }
    for (const restaurantIdMatch of restaurantIdCandidates) {
      const ratingAgg = yield review_1.ReviewModel.aggregate([
        {
          $match: {
            restaurant_id: restaurantIdMatch,
            deleted: { $ne: true },
            globalRating: { $ne: null }
          }
        },
        {
          $group: {
            _id: '$restaurant_id',
            averageRating: { $avg: '$globalRating' }
          }
        }
      ]);
      console.log('Aggregation result:', ratingAgg);
      if (ratingAgg.length > 0 && ratingAgg[0].averageRating !== null && ratingAgg[0].averageRating !== undefined) {
        return Number(ratingAgg[0].averageRating.toFixed(1));
      }
    }
    return 0;
  });
const getRestaurant = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [restaurant, globalRating] = yield Promise.all([
      restaurant_1.RestaurantModel.findById(restaurant_id)
        .active()
        .select('profile.name profile.globalRating profile.category profile.image profile.location.city profile.location.address profile.contact profile.description profile.timetable')
        .lean(),
      getRestaurantGlobalRating(restaurant_id)
    ]);
    if (!restaurant) return null;
    return Object.assign(Object.assign({}, restaurant), {
      profile: Object.assign(Object.assign({}, restaurant.profile), { globalRating, image: (_a = restaurant.profile.image) === null || _a === void 0 ? void 0 : _a.slice(0, 3) })
    });
  });
const getDeletedRestaurant = (restaurantId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return restaurant_1.RestaurantModel.findOne({ _id: restaurantId, deletedAt: { $ne: null } }).lean();
  });
const getAllRestaurants = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [restaurants, total] = yield Promise.all([
      restaurant_1.RestaurantModel.find()
        .active()
        .select(
          'profile.name profile.globalRating profile.category profile.image profile.location.city profile.location.address profile.contact profile.description profile.timetable profile.location.coordinates'
        )
        .skip(skip)
        .limit(limit)
        .lean(),
      restaurant_1.RestaurantModel.countDocuments({ deletedAt: null })
    ]);
    const formattedRestaurants = restaurants.map((r) => {
      var _a;
      return Object.assign(Object.assign({}, r), { profile: Object.assign(Object.assign({}, r.profile), { image: (_a = r.profile.image) === null || _a === void 0 ? void 0 : _a.slice(0, 3) }) });
    });
    return { restaurants: formattedRestaurants, total };
  });
const getAllDeletedRestaurants = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { deletedAt: { $ne: null } };
    const [restaurants, total] = yield Promise.all([
      restaurant_1.RestaurantModel.find(filter)
        .select(
          'profile.name profile.globalRating profile.category profile.image profile.location.city profile.location.address profile.contact profile.description profile.timetable profile.location.coordinates'
        )
        .skip(skip)
        .limit(limit)
        .lean(),
      restaurant_1.RestaurantModel.countDocuments(filter)
    ]);
    const formattedRestaurants = restaurants.map((r) => {
      var _a;
      return Object.assign(Object.assign({}, r), { profile: Object.assign(Object.assign({}, r.profile), { image: (_a = r.profile.image) === null || _a === void 0 ? void 0 : _a.slice(0, 3) }) });
    });
    return { restaurants: formattedRestaurants, total };
  });
const updateRestaurant = (restaurant_id, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = yield restaurant_1.RestaurantModel.findById(restaurant_id).active();
    if (!restaurant) return null;
    restaurant.set(data);
    return restaurant.save();
  });
// ─────────────────────────────────────────────────────────────────────────────
// Delete / restore
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Soft-delete: sets deletedAt to now.
 * Returns null if the restaurant is not found OR is already soft-deleted.
 */
const softDeleteRestaurant = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return restaurant_1.RestaurantModel.findOneAndUpdate(
      { _id: restaurant_id, deletedAt: null }, // guard: only active docs
      { deletedAt: new Date() },
      { new: true }
    ).lean();
  });
/**
 * Restore: clears deletedAt, making the restaurant active again.
 * Returns null if the restaurant is not found OR is already active.
 */
const restoreRestaurant = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return restaurant_1.RestaurantModel.findOneAndUpdate(
      { _id: restaurant_id, deletedAt: { $ne: null } }, // guard: only deleted docs
      { deletedAt: null },
      { new: true }
    ).lean();
  });
/**
 * Hard-delete: permanently removes the document.
 * Use only for admin operations or GDPR erasure requests.
 */
const hardDeleteRestaurant = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return restaurant_1.RestaurantModel.findByIdAndDelete(restaurant_id).lean();
  });
// ─────────────────────────────────────────────────────────────────────────────
// Read variants
// ─────────────────────────────────────────────────────────────────────────────
const getRestaurantCustomers = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { favoriteRestaurants: new mongoose_1.default.Types.ObjectId(restaurant_id), deletedAt: null };
    const [customers, total] = yield Promise.all([customer_1.CustomerModel.find(filter).skip(skip).limit(limit).lean(), customer_1.CustomerModel.countDocuments(filter)]);
    return { customers, total };
  });
const getDeletedRestaurantCustomers = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { favoriteRestaurants: new mongoose_1.default.Types.ObjectId(restaurant_id), deletedAt: null };
    const [customers, total] = yield Promise.all([customer_1.CustomerModel.find(filter).skip(skip).limit(limit).lean(), customer_1.CustomerModel.countDocuments(filter)]);
    return { customers, total };
  });
const getRestaurantFull = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [restaurant, globalRating] = yield Promise.all([
      restaurant_1.RestaurantModel.findById(restaurant_id)
        .populate('employees')
        .populate('rewards')
        .populate('badges')
        .populate('statistics')
        .populate('dishes')
        .populate('visits')
        .populate('reviews')
        .lean(),
      getRestaurantGlobalRating(restaurant_id)
    ]);
    if (!restaurant) return null;
    return Object.assign(Object.assign({}, restaurant), { profile: Object.assign(Object.assign({}, restaurant.profile), { globalRating }) });
  });
const getRestaurantDetailedForCustomerFrontend = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return restaurant_1.RestaurantModel.findById(restaurant_id).active().populate('rewards').populate('badges').populate('dishes').populate('reviews').lean();
  });
const getDeletedRestaurantFull = (restaurantId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return restaurant_1.RestaurantModel.findOne({ _id: restaurantId, deletedAt: { $ne: null } })
      .populate('employees')
      .populate('rewards')
      .populate('badges')
      .populate('statistics')
      .populate('dishes')
      .populate('visits')
      .populate('reviews')
      .lean();
  });
const getReestaurantsNearby = (lng, lat, maxDistance) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return restaurant_1.RestaurantModel.find({
      deletedAt: null,
      'profile.location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance
        }
      }
    })
      .select('profile.name profile.globalRating profile.category profile.image profile.location.city profile.location.coordinates')
      .lean();
  });
const getBadges = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = yield restaurant_1.RestaurantModel.findById(restaurant_id)
      .populate({
        path: 'badges',
        match: { deletedAt: null },
        options: { skip, limit }
      })
      .lean();
    if (!restaurant) return { badges: [], total: 0 };
    const total = yield restaurant_1.RestaurantModel.findById(restaurant_id)
      .lean()
      .then((r) => {
        var _a;
        return ((_a = r === null || r === void 0 ? void 0 : r.badges) === null || _a === void 0 ? void 0 : _a.length) || 0;
      });
    return { badges: restaurant.badges || [], total };
  });
const getDeletedRestaurantBadges = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = yield restaurant_1.RestaurantModel.findById(restaurant_id)
      .populate({
        path: 'badges',
        match: { deletedAt: { $ne: null } },
        options: { skip, limit }
      })
      .lean();
    if (!restaurant) return { badges: [], total: 0 };
    // We count only deleted badges in this restaurant
    const total = yield badge_1.BadgeModel.countDocuments({
      _id: { $in: restaurant.badges },
      deletedAt: { $ne: null }
    });
    return { badges: restaurant.badges || [], total };
  });
const getStatistics = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id) };
    const stats = yield statistics_1.StatisticsModel.findOne(filter).lean();
    return stats;
  });
const getDeletedRestaurantStatistics = (restaurant_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), deletedAt: { $ne: null } };
    const stats = yield statistics_1.StatisticsModel.findOne(filter).select('statistics').populate('statistics').lean();
    return stats;
  });
const getEmployees = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), isActive: true };
    const [employees, total] = yield Promise.all([employee_1.EmployeeModel.find(filter).skip(skip).limit(limit).lean(), employee_1.EmployeeModel.countDocuments(filter)]);
    return { employees, total };
  });
const getDeletedRestaurantEmployees = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), isActive: false };
    const [employees, total] = yield Promise.all([employee_1.EmployeeModel.find(filter).skip(skip).limit(limit).lean(), employee_1.EmployeeModel.countDocuments(filter)]);
    return { employees, total };
  });
const getDishes = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), active: true };
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find(filter).skip(skip).limit(limit).lean(), dish_1.DishModel.countDocuments(filter)]);
    return { dishes, total };
  });
const getDeletedRestaurantDishes = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), active: false };
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find(filter).skip(skip).limit(limit).lean(), dish_1.DishModel.countDocuments(filter)]);
    return { dishes, total };
  });
const getTopDishByRestaurant = (restaurantId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(restaurantId)) return null;
    const pipeline = [
      {
        $match: {
          restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId),
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
      { $sort: { averageRating: -1, totalRatings: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'dishes',
          localField: '_id',
          foreignField: '_id',
          as: 'dish'
        }
      },
      { $unwind: '$dish' },
      { $match: { 'dish.active': true } },
      {
        $project: {
          _id: 0,
          name: '$dish.name',
          averageRating: 1,
          totalRatings: 1
        }
      }
    ];
    const [topDish] = yield dishRating_1.DishRatingModel.aggregate(pipeline);
    if (!topDish) return null;
    return {
      name: topDish.name,
      averageRating: Math.round(topDish.averageRating * 10) / 10,
      totalRatings: topDish.totalRatings
    };
  });
const getRewards = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), active: true };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(filter).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(filter)]);
    return { rewards, total };
  });
const getDeletedRestaurantRewards = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), active: false };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(filter).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(filter)]);
    return { rewards, total };
  });
const getVisits = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), deletedAt: null };
    const [visits, total] = yield Promise.all([visit_1.VisitModel.find(filter).skip(skip).limit(limit).lean(), visit_1.VisitModel.countDocuments(filter)]);
    return { visits, total };
  });
const getDeletedRestaurantVisits = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), deletedAt: { $ne: null } };
    const [visits, total] = yield Promise.all([visit_1.VisitModel.find(filter).skip(skip).limit(limit).lean(), visit_1.VisitModel.countDocuments(filter)]);
    return { visits, total };
  });
const getReviews = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), deleted: false };
    const [reviews, total] = yield Promise.all([review_1.ReviewModel.find(filter).skip(skip).limit(limit).lean(), review_1.ReviewModel.countDocuments(filter)]);
    return { reviews, total };
  });
const getDeletedRestaurantReviews = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id), deleted: true };
    const [reviews, total] = yield Promise.all([review_1.ReviewModel.find(filter).skip(skip).limit(limit).lean(), review_1.ReviewModel.countDocuments(filter)]);
    return { reviews, total };
  });
// ─────────────────────────────────────────────────────────────────────────────
// globalRating recalculation
// ─────────────────────────────────────────────────────────────────────────────
const updateGlobalRating = (restaurant_id, newAverage) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const clamped = Math.min(10, Math.max(0, newAverage));
    return restaurant_1.RestaurantModel.findByIdAndUpdate(restaurant_id, { 'profile.globalRating': clamped }, { new: true, runValidators: true }).lean();
  });
function getDayKey(date) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}
function buildOpenAtStages(date) {
  const dayKey = getDayKey(date);
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const toMinutes = (fieldRef) => ({
    $add: [
      {
        $multiply: [{ $toInt: { $arrayElemAt: [{ $split: [fieldRef, ':'] }, 0] } }, 60]
      },
      { $toInt: { $arrayElemAt: [{ $split: [fieldRef, ':'] }, 1] } }
    ]
  });
  const addFieldsStage = {
    $addFields: {
      _isOpen: {
        $reduce: {
          input: { $ifNull: [`$profile.timetable.${dayKey}`, []] },
          initialValue: false,
          in: {
            $or: [
              '$$value',
              {
                $and: [{ $gte: [currentMinutes, toMinutes('$$this.open')] }, { $lt: [currentMinutes, toMinutes('$$this.close')] }]
              }
            ]
          }
        }
      }
    }
  };
  return [addFieldsStage, { $match: { _isOpen: true } }, { $project: { _isOpen: 0 } }];
}
const getFilteredRestaurants = (params) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { lng, lat, radiusMeters = 5000, categories, minGlobalRating, city, openNow, openAt } = params;
    const hasGeo = lng !== undefined && lat !== undefined && isFinite(lng) && isFinite(lat);
    const pipeline = [];
    const baseFilter = { deletedAt: null };
    if (hasGeo) {
      if (city) baseFilter['profile.location.city'] = { $regex: city, $options: 'i' };
      if (minGlobalRating) baseFilter['profile.globalRating'] = { $gte: minGlobalRating };
      if (categories === null || categories === void 0 ? void 0 : categories.length) baseFilter['profile.category'] = { $in: categories };
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: radiusMeters,
          spherical: true,
          query: baseFilter
        }
      });
    } else {
      if (city) baseFilter['profile.location.city'] = { $regex: city, $options: 'i' };
      if (minGlobalRating) baseFilter['profile.globalRating'] = { $gte: minGlobalRating };
      if (categories === null || categories === void 0 ? void 0 : categories.length) baseFilter['profile.category'] = { $in: categories };
      pipeline.push({ $match: baseFilter });
    }
    const targetDate = openAt ? new Date(openAt) : openNow ? new Date() : null;
    if (targetDate && isFinite(targetDate.getTime())) {
      pipeline.push(...buildOpenAtStages(targetDate));
    }
    if (!hasGeo) {
      pipeline.push({ $sort: { 'profile.globalRating': -1, 'profile.name': 1 } });
    }
    return restaurant_1.RestaurantModel.aggregate(pipeline).exec();
  });
// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
exports.default = {
  createRestaurant,
  getRestaurant,
  getDeletedRestaurant,
  getAllRestaurants,
  getAllDeletedRestaurants,
  updateRestaurant,
  softDeleteRestaurant,
  restoreRestaurant,
  hardDeleteRestaurant,
  getRestaurantCustomers,
  getDeletedRestaurantCustomers,
  getRestaurantFull,
  getRestaurantDetailedForCustomerFrontend,
  getDeletedRestaurantFull,
  getReestaurantsNearby,
  getBadges,
  getDeletedRestaurantBadges,
  getStatistics,
  getDeletedRestaurantStatistics,
  getEmployees,
  getDeletedRestaurantEmployees,
  getDishes,
  getDeletedRestaurantDishes,
  getTopDishByRestaurant,
  getRewards,
  getDeletedRestaurantRewards,
  getVisits,
  getDeletedRestaurantVisits,
  getReviews,
  getDeletedRestaurantReviews,
  updateGlobalRating,
  getFilteredRestaurants
};
//# sourceMappingURL=restaurant.js.map
