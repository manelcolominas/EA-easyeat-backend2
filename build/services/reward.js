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
const reward_1 = require('../models/reward');
const restaurant_1 = require('../models/restaurant');
const customer_1 = require('../models/customer');
const pointsWallet_1 = require('../models/pointsWallet');
const notification_1 = __importDefault(require('./notification'));
const createReward = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const reward = new reward_1.RewardModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    const savedReward = yield reward.save();
    // Automatically add the new reward ID to the restaurant's rewards array
    if (data.restaurant_id) {
      const restaurant = yield restaurant_1.RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
        $push: { rewards: savedReward._id }
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
              type: 'new_reward',
              title: `Nova recompensa a ${restaurantName}!`,
              message: `S'ha afegit una nova recompensa: "${savedReward.name}". Aprofita els teus punts!`,
              data: {
                reward_id: savedReward._id
              }
            });
          } catch (innerErr) {
            console.warn(`Failed to send notification to customer ${customerId}:`, (innerErr === null || innerErr === void 0 ? void 0 : innerErr.message) || innerErr);
          }
        }
      } catch (err) {
        console.error('Error sending reward creation notifications:', (err === null || err === void 0 ? void 0 : err.message) || err);
      }
    }
    return savedReward;
  });
const getReward = (reward_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findById(reward_id);
  });
const getDeletedReward = (reward_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findOne({ _id: reward_id, active: false }).lean();
  });
const getAllRewards = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find().skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments()]);
    return { rewards, total };
  });
const getAllDeletedRewards = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { active: false };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(filter).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(filter)]);
    return { rewards, total };
  });
const getByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: true };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(query)]);
    return { rewards, total };
  });
const getDeletedByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: false };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(query)]);
    return { rewards, total };
  });
const updateReward = (reward_id, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const reward = yield reward_1.RewardModel.findById(reward_id);
    if (reward) {
      reward.set(data);
      return yield reward.save();
    }
    return null;
  });
const softDeleteReward = (reward_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findByIdAndUpdate(reward_id, { active: false }, { new: true }).lean();
  });
const restoreReward = (reward_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findByIdAndUpdate(reward_id, { active: true }, { new: true }).lean();
  });
const hardDeleteReward = (reward_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const deletedReward = yield reward_1.RewardModel.findByIdAndDelete(reward_id);
    if (deletedReward && deletedReward.restaurant_id) {
      yield restaurant_1.RestaurantModel.findByIdAndUpdate(deletedReward.restaurant_id, {
        $pull: { rewards: deletedReward._id }
      });
    }
    return deletedReward;
  });
exports.default = {
  createReward,
  getReward,
  getDeletedReward,
  getAllRewards,
  getAllDeletedRewards,
  getByRestaurant,
  getDeletedByRestaurant,
  updateReward,
  softDeleteReward,
  restoreReward,
  hardDeleteReward
};
//# sourceMappingURL=reward.js.map
