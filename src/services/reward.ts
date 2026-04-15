import mongoose from 'mongoose';
import { RewardModel, IReward } from '../models/reward';
import { RestaurantModel } from '../models/restaurant';

const createReward = async (data: Partial<IReward>) => {
    const reward = new RewardModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });

    const savedReward = await reward.save();

    // Automatically add the new reward ID to the restaurant's rewards array
    if (data.restaurant_id) {
        await RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
            $push: { rewards: savedReward._id }
        });
    }

    return savedReward;
};

const getReward = async (reward_id: string) => {
    return await RewardModel.findById(reward_id);
};

const getDeletedReward = async (reward_id: string) => {
    return await RewardModel.findOne({ _id: reward_id, active: false }).lean();
};

const getAllRewards = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    return await RewardModel.find()
        .skip(skip)
        .limit(limit);
};

const getAllDeletedRewards = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    return await RewardModel.find({ active: false })
        .skip(skip)
        .limit(limit);
};

const updateReward = async (reward_id: string, data: Partial<IReward>) => {
    const reward = await RewardModel.findById(reward_id);

    if (reward) {
        reward.set(data);
        return await reward.save();
    }

    return null;
};

const softDeleteReward = async (reward_id: string) => {
    return await RewardModel.findByIdAndUpdate(reward_id, { active: false }, { new: true }).lean();
};

const restoreReward = async (reward_id: string) => {
    return await RewardModel.findByIdAndUpdate(reward_id, { active: true }, { new: true }).lean();
};

const hardDeleteReward = async (reward_id: string) => {
    const deletedReward = await RewardModel.findByIdAndDelete(reward_id);

    // Automatically remove the reward ID from the restaurant's rewards array
    if (deletedReward && deletedReward.restaurant_id) {
        await RestaurantModel.findByIdAndUpdate(deletedReward.restaurant_id, {
            $pull: { rewards: deletedReward._id }
        });
    }

    return deletedReward;
};

export default {
    createReward,
    getReward,
    getDeletedReward,
    getAllRewards,
    getAllDeletedRewards,
    updateReward,
    softDeleteReward,
    restoreReward,
    hardDeleteReward
};