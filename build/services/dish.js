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
const dish_1 = require('../models/dish');
const restaurant_1 = require('../models/restaurant');
const customer_1 = require('../models/customer');
const pointsWallet_1 = require('../models/pointsWallet');
const notification_1 = __importDefault(require('./notification'));
const logging_1 = __importDefault(require('../library/logging'));
const createDish = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dish = new dish_1.DishModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    const savedDish = yield dish.save();
    if (data.restaurant_id) {
      const restaurant = yield restaurant_1.RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
        $push: { dishes: savedDish._id }
      });
      // Send notifications to eligible customers
      try {
        const restaurantName = ((_a = restaurant === null || restaurant === void 0 ? void 0 : restaurant.profile) === null || _a === void 0 ? void 0 : _a.name) || 'Restaurant';
        // Get all customer IDs that have points from this restaurant
        const walletCustomerIds = yield pointsWallet_1.PointsWalletModel.find({
          restaurant_id: data.restaurant_id,
          points: { $gt: 0 }
        }).distinct('customer_id');
        // Find active customers who either have this restaurant as a favorite OR have points
        const targetCustomerIds = yield customer_1.CustomerModel.find({
          $or: [{ favoriteRestaurants: data.restaurant_id }, { _id: { $in: walletCustomerIds } }],
          deletedAt: null
        }).distinct('_id');
        // Send a notification to each target customer
        for (const customerId of targetCustomerIds) {
          try {
            yield notification_1.default.createAndSendNotification({
              customer_id: customerId,
              restaurant_id: data.restaurant_id,
              type: 'new_dish',
              title: `Nou plat a ${restaurantName}!`,
              message: `S'ha afegit un nou plat: "${savedDish.name}". Vine a provar-lo!`,
              data: {
                dish_id: savedDish._id
              }
            });
          } catch (innerErr) {
            logging_1.default.error(`Failed to send new dish notification to customer ${customerId}:`, (innerErr === null || innerErr === void 0 ? void 0 : innerErr.message) || innerErr);
          }
        }
      } catch (err) {
        logging_1.default.error('Error sending new dish notifications:', (err === null || err === void 0 ? void 0 : err.message) || err);
      }
    }
    return savedDish;
  });
const getDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findById(dish_id);
  });
const getDeletedDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findOne({ _id: dish_id, active: false }).lean();
  });
const getAllDishes = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find({ active: true }).lean().skip(skip).limit(limit), dish_1.DishModel.countDocuments({ active: true })]);
    return { dishes, total };
  });
const getAllDeletedDishes = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find({ active: false }).lean().skip(skip).limit(limit), dish_1.DishModel.countDocuments({ active: false })]);
    return { dishes, total };
  });
const getByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: true };
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find(query).skip(skip).limit(limit).lean(), dish_1.DishModel.countDocuments(query)]);
    return { dishes, total };
  });
const getDeletedByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: false };
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find(query).skip(skip).limit(limit).lean(), dish_1.DishModel.countDocuments(query)]);
    return { dishes, total };
  });
const updateDish = (dish_id, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const dish = yield dish_1.DishModel.findById(dish_id);
    if (dish) {
      dish.set(data);
      return yield dish.save();
    }
    return null;
  });
const softDeleteDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findByIdAndUpdate(dish_id, { active: false }, { new: true }).lean();
  });
const restoreDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findByIdAndUpdate(dish_id, { active: true }, { new: true }).lean();
  });
const hardDeleteDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const deletedDish = yield dish_1.DishModel.findByIdAndDelete(dish_id);
    if (deletedDish && deletedDish.restaurant_id) {
      yield restaurant_1.RestaurantModel.findByIdAndUpdate(deletedDish.restaurant_id, {
        $pull: { dishes: deletedDish._id }
      });
    }
    return deletedDish;
  });
exports.default = {
  createDish,
  getDish,
  getDeletedDish,
  getAllDishes,
  getAllDeletedDishes,
  getByRestaurant,
  getDeletedByRestaurant,
  updateDish,
  softDeleteDish,
  restoreDish,
  hardDeleteDish
};
//# sourceMappingURL=dish.js.map
