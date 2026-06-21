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
const customer_1 = require('../models/customer');
const softDelete_1 = require('../utils/softDelete');
const pointsWallet_1 = require('../models/pointsWallet');
const visit_1 = require('../models/visit');
const restaurant_1 = require('../models/restaurant');
const badge_1 = require('../models/badge');
const review_1 = require('../models/review');
// ─── Create ───────────────────────────────────────────────────────────────────
const createCustomer = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const customer = new customer_1.CustomerModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    return customer.save();
  });
// ─── Read (single) ────────────────────────────────────────────────────────────
const getCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return customer_1.CustomerModel.findById(customer_id);
  });
const getDeletedCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return customer_1.CustomerModel.findOne({ _id: customer_id, deletedAt: { $ne: null } });
  });
const getCustomerFull = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return customer_1.CustomerModel.findById(customer_id)
      .populate('pointsWallet')
      .populate('visitHistory')
      .populate({
        path: 'favoriteRestaurants',
        select: 'profile.name profile.description profile.globalRating profile.category profile.image profile.location.city',
        transform: (doc) => {
          if (doc && doc.profile && doc.profile.image && Array.isArray(doc.profile.image)) {
            doc.profile.image = doc.profile.image.slice(0, 3);
          }
          return doc;
        }
      })
      .populate('badges')
      .populate('reviews');
  });
const getDeletedCustomerFull = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return customer_1.CustomerModel.findOne({ _id: customer_id, deletedAt: { $ne: null } })
      .populate('pointsWallet')
      .populate('visitHistory')
      .populate({
        path: 'favoriteRestaurants',
        select: 'profile.name profile.description profile.globalRating profile.category profile.image profile.location.city',
        transform: (doc) => {
          if (doc && doc.profile && doc.profile.image && Array.isArray(doc.profile.image)) {
            doc.profile.image = doc.profile.image.slice(0, 3);
          }
          return doc;
        }
      })
      .populate('badges')
      .populate('reviews');
  });
// ─── Get all points wallets for a customer ────────────────────────────────────
const getCustomerAllPointsWallet = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { customer_id: customer_id };
    const [pointsWallet, total] = yield Promise.all([
      pointsWallet_1.PointsWalletModel.find(filter).populate('restaurant_id', 'profile.name profile.location').skip(skip).limit(limit).lean(),
      pointsWallet_1.PointsWalletModel.countDocuments(filter)
    ]);
    return { pointsWallet, total };
  });
// ─── Get all visits for a customer ────────────────────────────────────────────
const getCustomerAllVisits = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { customer_id: customer_id, deletedAt: null };
    const [visits, total] = yield Promise.all([
      visit_1.VisitModel.find(filter).populate('restaurant_id', 'profile.name profile.rating profile.location.city').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      visit_1.VisitModel.countDocuments(filter)
    ]);
    return { visits, total };
  });
const getCustomerAllDeletedVisits = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { customer_id: customer_id, deletedAt: { $ne: null } };
    const [visits, total] = yield Promise.all([
      visit_1.VisitModel.find(filter).populate('restaurant_id', 'profile.name profile.rating profile.location.city').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      visit_1.VisitModel.countDocuments(filter)
    ]);
    return { visits, total };
  });
// ─── Get all favourite restaurants for a customer ────────────────────────────
const getCustomerAllFavouriteRestaurants = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customer_1.CustomerModel.findById(customer_id).active().select('favoriteRestaurants').lean();
    if (!customer || !customer.favoriteRestaurants || customer.favoriteRestaurants.length === 0) {
      return { favoriteRestaurants: [], total: 0 };
    }
    const filter = { _id: { $in: customer.favoriteRestaurants }, deletedAt: null };
    const [restaurants, total] = yield Promise.all([
      restaurant_1.RestaurantModel.find(filter).select('profile.name profile.description profile.globalRating profile.category profile.image profile.location.city').skip(skip).limit(limit).lean(),
      restaurant_1.RestaurantModel.countDocuments(filter)
    ]);
    const favoriteRestaurants = restaurants.map((doc) => {
      var _a;
      if (((_a = doc === null || doc === void 0 ? void 0 : doc.profile) === null || _a === void 0 ? void 0 : _a.image) && Array.isArray(doc.profile.image)) {
        doc.profile.image = doc.profile.image.slice(0, 3);
      }
      return doc;
    });
    return { favoriteRestaurants, total };
  });
// ─── Get all badges earned by a customer ──────────────────────────────────────
const getCustomerAllBadges = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customer_1.CustomerModel.findById(customer_id).active().select('badges').lean();
    if (!customer || !customer.badges || customer.badges.length === 0) {
      return { badges: [], total: 0 };
    }
    const filter = { _id: { $in: customer.badges }, deletedAt: null };
    const [badges, total] = yield Promise.all([badge_1.BadgeModel.find(filter).select('title description type').skip(skip).limit(limit).lean(), badge_1.BadgeModel.countDocuments(filter)]);
    return { badges, total };
  });
// ─── Get all reviews written by a customer ────────────────────────────────────
const getCustomerAllReviews = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { customer_id: customer_id, deletedAt: null, deleted: { $ne: true } };
    const [reviews, total] = yield Promise.all([
      review_1.ReviewModel.find(filter).populate('restaurant_id', 'profile.name profile.rating').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      review_1.ReviewModel.countDocuments(filter)
    ]);
    return { reviews, total };
  });
// ─── Read (paginated list) ────────────────────────────────────────────────────
const getAllCustomers = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { deletedAt: null };
    const [data, total] = yield Promise.all([customer_1.CustomerModel.find(filter).skip(skip).limit(limit).lean(), customer_1.CustomerModel.countDocuments(filter)]);
    return { data, total };
  });
const getAllDeletedCustomers = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { deletedAt: { $ne: null } };
    const [data, total] = yield Promise.all([customer_1.CustomerModel.find(filter).skip(skip).limit(limit).lean(), customer_1.CustomerModel.countDocuments(filter)]);
    return { data, total };
  });
const getCustomersByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const restaurantObjectId = new mongoose_1.default.Types.ObjectId(restaurant_id);
    // Identificar clientes únicos a partir de las visitas reales usando agregación para mayor robustez
    const visits = yield visit_1.VisitModel.aggregate([
      {
        $match: {
          restaurant_id: restaurantObjectId,
          deletedAt: null
        }
      },
      {
        $group: {
          _id: '$customer_id'
        }
      }
    ]);
    const uniqueCustomerIds = visits.map((v) => v._id);
    if (uniqueCustomerIds.length === 0) {
      return { customers: [], total: 0 };
    }
    // Filtrar clientes por esos IDs y asegurarse de que no estén eliminados
    const filter = { _id: { $in: uniqueCustomerIds }, deletedAt: null };
    const [customers, total] = yield Promise.all([customer_1.CustomerModel.find(filter).skip(skip).limit(limit).lean(), customer_1.CustomerModel.countDocuments(filter)]);
    return { customers, total };
  });
// ─── Update ───────────────────────────────────────────────────────────────────
const updateCustomer = (customer_id, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customer_1.CustomerModel.findOne({ _id: customer_id }).active();
    if (!customer) return null;
    customer.set(data);
    return customer.save();
  });
// ─── Soft Delete ──────────────────────────────────────────────────────────────
const softDeleteCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return (0, softDelete_1.softDeleteDocument)(customer_1.CustomerModel, customer_id);
  });
// ─── Restore ─────────────────────────────────────────────────────────────────
const restoreCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return (0, softDelete_1.restoreDocument)(customer_1.CustomerModel, customer_id);
  });
// ─── Hard Delete (admin only) ─────────────────────────────────────────────────
const hardDeleteCustomer = (customer_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return customer_1.CustomerModel.findByIdAndDelete(customer_id);
  });
exports.default = {
  createCustomer,
  getCustomer,
  getDeletedCustomer,
  getCustomerFull,
  getDeletedCustomerFull,
  getAllCustomers,
  getAllDeletedCustomers,
  getCustomerAllBadges,
  getCustomerAllFavouriteRestaurants,
  getCustomerAllPointsWallet,
  getCustomerAllReviews,
  getCustomerAllVisits,
  getCustomerAllDeletedVisits,
  getCustomersByRestaurant,
  updateCustomer,
  softDeleteCustomer,
  restoreCustomer,
  hardDeleteCustomer
};
//# sourceMappingURL=customer.js.map
