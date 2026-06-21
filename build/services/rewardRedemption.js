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
const rewardRedemption_1 = require('../models/rewardRedemption');
const customer_1 = require('../models/customer');
const reward_1 = require('../models/reward');
const pointsWallet_1 = require('../models/pointsWallet');
const buildError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
const getRewardCost = (reward) => {
  const value = Number(reward === null || reward === void 0 ? void 0 : reward.pointsRequired);
  if (!Number.isFinite(value) || value <= 0) {
    throw buildError(500, 'Reward pointsRequired is not configured correctly');
  }
  return value;
};
const getRewardExpiry = (reward) => {
  var _a;
  const raw = (_a = reward === null || reward === void 0 ? void 0 : reward.expiry) !== null && _a !== void 0 ? _a : null;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};
const createRewardRedemption = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const redemption = new rewardRedemption_1.RewardRedemptionModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    return yield redemption.save();
  });
const redeemReward = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
      let response = null;
      try {
        yield session.withTransaction(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const { customer_id, reward_id, employee_id, notes } = data;
            if (!mongoose_1.default.Types.ObjectId.isValid(customer_id)) {
              throw buildError(400, 'Invalid customer_id');
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(reward_id)) {
              throw buildError(400, 'Invalid reward_id');
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(employee_id)) {
              throw buildError(400, 'Invalid employee_id');
            }
            const customer = yield customer_1.CustomerModel.findOne({
              _id: new mongoose_1.default.Types.ObjectId(customer_id),
              deletedAt: null
            }).session(session);
            if (!customer) {
              throw buildError(404, 'Customer not found');
            }
            const reward = yield reward_1.RewardModel.findById(reward_id).session(session);
            if (!reward) {
              throw buildError(404, 'Reward not found');
            }
            if (reward.active === false) {
              throw buildError(400, 'Reward is not active');
            }
            const expiry = getRewardExpiry(reward);
            if (expiry && expiry.getTime() < Date.now()) {
              throw buildError(400, 'Reward has expired');
            }
            const restaurantId = String(reward.restaurant_id);
            if (!restaurantId || !mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
              throw buildError(500, 'Reward restaurant is not configured correctly');
            }
            const wallet = yield pointsWallet_1.PointsWalletModel.findOne({
              customer_id: new mongoose_1.default.Types.ObjectId(customer_id),
              restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId)
            }).session(session);
            if (!wallet) {
              throw buildError(404, 'Points wallet for this restaurant was not found');
            }
            const pointsUsed = getRewardCost(reward);
            if (wallet.points < pointsUsed) {
              throw buildError(400, 'Not enough points');
            }
            const pointsBefore = wallet.points;
            wallet.points = wallet.points - pointsUsed;
            yield wallet.save({ session });
            const [redemption] = yield rewardRedemption_1.RewardRedemptionModel.create(
              [
                {
                  customer_id: customer._id,
                  restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId),
                  reward_id: reward._id,
                  employee_id: new mongoose_1.default.Types.ObjectId(employee_id),
                  pointsUsed,
                  status: 'redeemed',
                  redeemedAt: new Date(),
                  notes: (notes === null || notes === void 0 ? void 0 : notes.trim()) || ''
                }
              ],
              { session }
            );
            reward.timesRedeemed = Number((_a = reward.timesRedeemed) !== null && _a !== void 0 ? _a : 0) + 1;
            yield reward.save({ session });
            response = {
              message: 'Reward redeemed successfully',
              redemption,
              wallet,
              pointsBefore,
              pointsAfter: wallet.points
            };
          })
        );
        return response;
      } catch (error) {
        if (isTransactionUnsupportedError(error)) {
          return yield redeemRewardWithoutTransaction(data);
        }
        throw error;
      }
    } finally {
      yield session.endSession();
    }
  });
const getRewardRedemption = (redemptionId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield rewardRedemption_1.RewardRedemptionModel.findById(redemptionId)
      .populate('customer_id', 'name email')
      .populate('reward_id', 'name description pointsRequired')
      .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
      .populate('employee_id', 'name');
  });
const getAllRewardRedemptions = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [redemptions, total] = yield Promise.all([
      rewardRedemption_1.RewardRedemptionModel.find()
        .populate('customer_id', 'name email')
        .populate('reward_id', 'name description pointsRequired')
        .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
        .populate('employee_id', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      rewardRedemption_1.RewardRedemptionModel.countDocuments()
    ]);
    return { redemptions, total };
  });
const getByCustomer = (customer_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [redemptions, total] = yield Promise.all([
      rewardRedemption_1.RewardRedemptionModel.find({ customer_id })
        .populate('reward_id', 'name description pointsRequired')
        .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
        .populate('employee_id', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      rewardRedemption_1.RewardRedemptionModel.countDocuments({ customer_id })
    ]);
    return { redemptions, total };
  });
const getByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [redemptions, total] = yield Promise.all([
      rewardRedemption_1.RewardRedemptionModel.find({ restaurant_id })
        .populate('customer_id', 'name email')
        .populate('reward_id', 'name description pointsRequired')
        .populate('employee_id', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      rewardRedemption_1.RewardRedemptionModel.countDocuments({ restaurant_id })
    ]);
    return { redemptions, total };
  });
const getByEmployee = (employee_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [redemptions, total] = yield Promise.all([
      rewardRedemption_1.RewardRedemptionModel.find({ employee_id })
        .populate('customer_id', 'name')
        .populate('reward_id', 'name')
        .populate('restaurant_id', 'profile.name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      rewardRedemption_1.RewardRedemptionModel.countDocuments({ employee_id })
    ]);
    return { redemptions, total };
  });
const getByReward = (reward_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [redemptions, total] = yield Promise.all([
      rewardRedemption_1.RewardRedemptionModel.find({ reward_id })
        .populate('customer_id', 'name email')
        .populate('restaurant_id', 'profile.name')
        .populate('employee_id', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      rewardRedemption_1.RewardRedemptionModel.countDocuments({ reward_id })
    ]);
    return { redemptions, total };
  });
const updateRewardRedemption = (redemptionId, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const redemption = yield rewardRedemption_1.RewardRedemptionModel.findById(redemptionId);
    if (!redemption) return null;
    redemption.set(data);
    return yield redemption.save();
  });
const updateStatus = (redemptionId, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const redemption = yield rewardRedemption_1.RewardRedemptionModel.findById(redemptionId);
    if (!redemption) return null;
    redemption.status = data.status;
    if (data.employee_id) {
      redemption.employee_id = new mongoose_1.default.Types.ObjectId(data.employee_id);
    }
    if (typeof data.notes === 'string') {
      redemption.notes = data.notes;
    }
    if (data.status === 'redeemed') {
      redemption.redeemedAt = new Date();
    }
    return yield redemption.save();
  });
const deleteRewardRedemption = (redemptionId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield rewardRedemption_1.RewardRedemptionModel.findByIdAndDelete(redemptionId);
  });
const isTransactionUnsupportedError = (error) => {
  const message = String((error === null || error === void 0 ? void 0 : error.message) || '');
  return message.includes('Transaction numbers are only allowed on a replica set member or mongos');
};
const redeemRewardWithoutTransaction = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { customer_id, reward_id, employee_id, notes } = data;
    if (!mongoose_1.default.Types.ObjectId.isValid(customer_id)) {
      throw buildError(400, 'Invalid customer_id');
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(reward_id)) {
      throw buildError(400, 'Invalid reward_id');
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(employee_id)) {
      throw buildError(400, 'Invalid employee_id');
    }
    const customer = yield customer_1.CustomerModel.findOne({
      _id: new mongoose_1.default.Types.ObjectId(customer_id),
      deletedAt: null
    });
    if (!customer) {
      throw buildError(404, 'Customer not found');
    }
    const reward = yield reward_1.RewardModel.findById(reward_id);
    if (!reward) {
      throw buildError(404, 'Reward not found');
    }
    if (reward.active === false) {
      throw buildError(400, 'Reward is not active');
    }
    const expiry = getRewardExpiry(reward);
    if (expiry && expiry.getTime() < Date.now()) {
      throw buildError(400, 'Reward has expired');
    }
    const restaurantId = String(reward.restaurant_id);
    if (!restaurantId || !mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
      throw buildError(500, 'Reward restaurant is not configured correctly');
    }
    const wallet = yield pointsWallet_1.PointsWalletModel.findOne({
      customer_id: new mongoose_1.default.Types.ObjectId(customer_id),
      restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId)
    });
    if (!wallet) {
      throw buildError(404, 'Points wallet for this restaurant was not found');
    }
    const pointsUsed = getRewardCost(reward);
    if (wallet.points < pointsUsed) {
      throw buildError(400, 'Not enough points');
    }
    const pointsBefore = wallet.points;
    // 1) crear redemption temporal en pending
    const redemption = yield rewardRedemption_1.RewardRedemptionModel.create({
      customer_id: customer._id,
      restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId),
      reward_id: reward._id,
      employee_id: new mongoose_1.default.Types.ObjectId(employee_id),
      pointsUsed,
      status: 'pending',
      redeemedAt: null,
      notes: (notes === null || notes === void 0 ? void 0 : notes.trim()) || ''
    });
    try {
      // 2) descomptar punts
      wallet.points = wallet.points - pointsUsed;
      yield wallet.save();
      // 3) incrementar comptador reward
      reward.timesRedeemed = Number((_a = reward.timesRedeemed) !== null && _a !== void 0 ? _a : 0) + 1;
      yield reward.save();
      // 4) tancar redemption
      redemption.status = 'redeemed';
      redemption.redeemedAt = new Date();
      yield redemption.save();
      return {
        message: 'Reward redeemed successfully (without transaction)',
        redemption,
        wallet,
        pointsBefore,
        pointsAfter: wallet.points
      };
    } catch (error) {
      try {
        wallet.points = pointsBefore;
        yield wallet.save();
      } catch (_c) {}
      try {
        reward.timesRedeemed = Math.max(0, Number((_b = reward.timesRedeemed) !== null && _b !== void 0 ? _b : 1) - 1);
        yield reward.save();
      } catch (_d) {}
      try {
        yield rewardRedemption_1.RewardRedemptionModel.findByIdAndDelete(redemption._id);
      } catch (_e) {}
      throw error;
    }
  });
exports.default = {
  createRewardRedemption,
  redeemReward,
  getRewardRedemption,
  getAllRewardRedemptions,
  getByCustomer,
  getByRestaurant,
  getByEmployee,
  getByReward,
  updateRewardRedemption,
  updateStatus,
  deleteRewardRedemption,
  isTransactionUnsupportedError,
  redeemRewardWithoutTransaction
};
//# sourceMappingURL=rewardRedemption.js.map
