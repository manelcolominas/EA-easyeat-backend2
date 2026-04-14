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

const getAllRewards = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    return await RewardModel.find()
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

const deleteReward = async (reward_id: string) => {
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
    getAllRewards,
    updateReward,
    deleteReward
};