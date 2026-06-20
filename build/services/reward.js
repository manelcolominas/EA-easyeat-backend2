"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reward_1 = require("../models/reward");
const restaurant_1 = require("../models/restaurant");
const createReward = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const reward = new reward_1.RewardModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    const savedReward = yield reward.save();
    // Automatically add the new reward ID to the restaurant's rewards array
    if (data.restaurant_id) {
        yield restaurant_1.RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
            $push: { rewards: savedReward._id }
        });
    }
    return savedReward;
});
const getReward = (reward_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findById(reward_id);
});
const getDeletedReward = (reward_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findOne({ _id: reward_id, active: false }).lean();
});
const getAllRewards = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find().skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments()]);
    return { rewards, total };
});
const getAllDeletedRewards = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { active: false };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(filter).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(filter)]);
    return { rewards, total };
});
const getByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: true };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(query)]);
    return { rewards, total };
});
const getDeletedByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: false };
    const [rewards, total] = yield Promise.all([reward_1.RewardModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(), reward_1.RewardModel.countDocuments(query)]);
    return { rewards, total };
});
const updateReward = (reward_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const reward = yield reward_1.RewardModel.findById(reward_id);
    if (reward) {
        reward.set(data);
        return yield reward.save();
    }
    return null;
});
const softDeleteReward = (reward_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findByIdAndUpdate(reward_id, { active: false }, { new: true }).lean();
});
const restoreReward = (reward_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield reward_1.RewardModel.findByIdAndUpdate(reward_id, { active: true }, { new: true }).lean();
});
const hardDeleteReward = (reward_id) => __awaiter(void 0, void 0, void 0, function* () {
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