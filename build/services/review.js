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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const mongoose_1 = __importDefault(require('mongoose'));
const review_1 = require('../models/review');
// ─── Filter Constants ─────────────────────────────────────────────────────────
const ACTIVE_REVIEW_FILTER = { deleted: false };
const DELETED_REVIEW_FILTER = { deleted: true };
// ─── CRUD ─────────────────────────────────────────────────────────────────────
const createReview = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const review = new review_1.ReviewModel(
      Object.assign(Object.assign({}, data), { customer_id: new mongoose_1.default.Types.ObjectId(data.customer_id), restaurant_id: new mongoose_1.default.Types.ObjectId(data.restaurant_id) })
    );
    return review.save();
  });
const getReview = (reviewId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return review_1.ReviewModel.findOne(Object.assign({ _id: reviewId }, ACTIVE_REVIEW_FILTER))
      .populate('customer_id', 'name profilePictures')
      .populate('restaurant_id', 'name')
      .lean();
  });
const getDeletedReview = (reviewId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return review_1.ReviewModel.findOne(Object.assign({ _id: reviewId }, DELETED_REVIEW_FILTER))
      .populate('customer_id', 'name profilePictures')
      .populate('restaurant_id', 'name')
      .lean();
  });
const getAllReviews = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [reviews, total] = yield Promise.all([
      review_1.ReviewModel.find(ACTIVE_REVIEW_FILTER).populate('customer_id', 'name').populate('restaurant_id', 'name').skip(skip).limit(limit).lean(),
      review_1.ReviewModel.countDocuments(ACTIVE_REVIEW_FILTER)
    ]);
    return { reviews, total };
  });
const getAllDeletedReviews = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [reviews, total] = yield Promise.all([
      review_1.ReviewModel.find(DELETED_REVIEW_FILTER).populate('customer_id', 'name').populate('restaurant_id', 'name').skip(skip).limit(limit).lean(),
      review_1.ReviewModel.countDocuments(DELETED_REVIEW_FILTER)
    ]);
    return { reviews, total };
  });
const updateReview = (reviewId, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { _id, customer_id, restaurant_id } = data,
      safeData = __rest(data, ['_id', 'customer_id', 'restaurant_id']);
    return review_1.ReviewModel.findOneAndUpdate(Object.assign({ _id: reviewId }, ACTIVE_REVIEW_FILTER), safeData, { new: true, runValidators: true }).lean();
  });
// ─── Delete / Restore ─────────────────────────────────────────────────────────
const softDeleteReview = (reviewId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return review_1.ReviewModel.findOneAndUpdate(Object.assign({ _id: reviewId }, ACTIVE_REVIEW_FILTER), { deleted: true }, { new: true }).lean();
  });
const restoreReview = (reviewId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return review_1.ReviewModel.findOneAndUpdate(Object.assign({ _id: reviewId }, DELETED_REVIEW_FILTER), { deleted: false }, { new: true }).lean();
  });
const hardDeleteReview = (reviewId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return review_1.ReviewModel.findByIdAndDelete(reviewId).lean();
  });
// ─── Queries by relation ──────────────────────────────────────────────────────
const getReviewsByRestaurant = (restaurantId, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = Object.assign({ restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId) }, ACTIVE_REVIEW_FILTER);
    const [reviews, total] = yield Promise.all([
      review_1.ReviewModel.find(filter).populate('customer_id', 'name profilePictures').skip(skip).limit(limit).lean(),
      review_1.ReviewModel.countDocuments(filter)
    ]);
    return { reviews, total };
  });
const getDeletedReviewsByRestaurant = (restaurantId, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = Object.assign({ restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId) }, DELETED_REVIEW_FILTER);
    const [reviews, total] = yield Promise.all([
      review_1.ReviewModel.find(filter).populate('customer_id', 'name profilePictures').skip(skip).limit(limit).lean(),
      review_1.ReviewModel.countDocuments(filter)
    ]);
    return { reviews, total };
  });
// ─── Paginated queries by customer ───────────────────────────────────────────
const getReviewsByCustomer = (customerId_1, skip_1, limit_1, ...args_1) =>
  __awaiter(void 0, [customerId_1, skip_1, limit_1, ...args_1], void 0, function* (customerId, skip, limit, options = {}) {
    const filter = Object.assign({ customer_id: new mongoose_1.default.Types.ObjectId(customerId) }, ACTIVE_REVIEW_FILTER);
    if (options.minGlobalRating !== undefined) {
      filter.globalRating = { $gte: options.minGlobalRating };
    }
    const sort = options.sortByLikes ? { likes: -1 } : { createdAt: -1 };
    const [reviews, total] = yield Promise.all([
      review_1.ReviewModel.find(filter).sort(sort).skip(skip).limit(limit).populate({ path: 'restaurant_id', select: 'profile.name' }).lean(),
      review_1.ReviewModel.countDocuments(filter)
    ]);
    return { reviews, total };
  });
const getDeletedReviewsByCustomer = (customerId_1, skip_1, limit_1, ...args_1) =>
  __awaiter(void 0, [customerId_1, skip_1, limit_1, ...args_1], void 0, function* (customerId, skip, limit, options = {}) {
    const filter = Object.assign({ customer_id: new mongoose_1.default.Types.ObjectId(customerId) }, DELETED_REVIEW_FILTER);
    if (options.minGlobalRating !== undefined) {
      filter.globalRating = { $gte: options.minGlobalRating };
    }
    const sort = options.sortByLikes ? { likes: -1 } : { createdAt: -1 };
    const [reviews, total] = yield Promise.all([
      review_1.ReviewModel.find(filter).sort(sort).skip(skip).limit(limit).populate({ path: 'restaurant_id', select: 'profile.name' }).lean(),
      review_1.ReviewModel.countDocuments(filter)
    ]);
    return { reviews, total };
  });
// ─── Like ─────────────────────────────────────────────────────────────────────
const likeReview = (reviewId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return review_1.ReviewModel.findOneAndUpdate(Object.assign({ _id: reviewId }, ACTIVE_REVIEW_FILTER), { $inc: { likes: 1 } }, { new: true }).lean();
  });
// ─── Exports ──────────────────────────────────────────────────────────────────
exports.default = {
  createReview,
  getReview,
  getDeletedReview,
  getAllReviews,
  getAllDeletedReviews,
  updateReview,
  softDeleteReview,
  restoreReview,
  hardDeleteReview,
  getReviewsByRestaurant,
  getDeletedReviewsByRestaurant,
  getReviewsByCustomer,
  getDeletedReviewsByCustomer,
  likeReview
};
//# sourceMappingURL=review.js.map
