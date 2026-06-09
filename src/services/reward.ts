import mongoose from 'mongoose';
import { RewardModel, IReward } from '../models/reward';
import { RestaurantModel } from '../models/restaurant';
import { CustomerModel } from '../models/customer';
import { PointsWalletModel } from '../models/pointsWallet';
import NotificationService from './notification';

const createReward = async (data: Partial<IReward>) => {
  const reward = new RewardModel({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });

  const savedReward = await reward.save();

  // Automatically add the new reward ID to the restaurant's rewards array
  if (data.restaurant_id) {
    const restaurant = await RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
      $push: { rewards: savedReward._id }
    });

    // Send notifications to eligible customers
    try {
      const restaurantName = restaurant?.profile?.name || 'Restaurant';

      // Get all customer IDs that have points from this restaurant
      const walletCustomerIds = await PointsWalletModel.find({
        restaurant_id: data.restaurant_id,
        points: { $gt: 0 }
      }).distinct('customer_id');

      // Find active customers who either have this restaurant as a favorite OR have points
      const targetCustomerIds = await CustomerModel.find({
        $or: [{ favoriteRestaurants: data.restaurant_id }, { _id: { $in: walletCustomerIds } }],
        deletedAt: null
      }).distinct('_id');

      // Send a notification to each target customer
      for (const customerId of targetCustomerIds) {
        try {
          await NotificationService.createAndSendNotification({
            customer_id: customerId as any,
            restaurant_id: data.restaurant_id as any,
            type: 'new_reward',
            title: `Nova recompensa a ${restaurantName}!`,
            message: `S'ha afegit una nova recompensa: "${savedReward.name}". Aprofita els teus punts!`,
            data: {
              reward_id: savedReward._id as any
            }
          });
        } catch (innerErr: any) {
          console.warn(`Failed to send notification to customer ${customerId}:`, innerErr?.message || innerErr);
        }
      }
    } catch (err: any) {
      console.error('Error sending reward creation notifications:', err?.message || err);
    }
  }

  return savedReward;
};

const getReward = async (reward_id: string) => {
  return await RewardModel.findById(reward_id);
};

const getDeletedReward = async (reward_id: string) => {
  return await RewardModel.findOne({ _id: reward_id, active: false }).lean();
};

const getAllRewards = async (skip: number, limit: number): Promise<{ rewards: IReward[]; total: number }> => {
  const [rewards, total] = await Promise.all([RewardModel.find().skip(skip).limit(limit).lean(), RewardModel.countDocuments()]);
  return { rewards, total };
};

const getAllDeletedRewards = async (skip: number, limit: number): Promise<{ rewards: IReward[]; total: number }> => {
  const filter = { active: false };
  const [rewards, total] = await Promise.all([RewardModel.find(filter).skip(skip).limit(limit).lean(), RewardModel.countDocuments(filter)]);
  return { rewards, total };
};

const getByRestaurant = async (restaurant_id: string, skip: number, limit: number) => {
  const query = { restaurant_id, active: true };
  const [rewards, total] = await Promise.all([RewardModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean<IReward[]>(), RewardModel.countDocuments(query)]);
  return { rewards, total };
};

const getDeletedByRestaurant = async (restaurant_id: string, skip: number, limit: number) => {
  const query = { restaurant_id, active: false };
  const [rewards, total] = await Promise.all([RewardModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean<IReward[]>(), RewardModel.countDocuments(query)]);
  return { rewards, total };
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
  getByRestaurant,
  getDeletedByRestaurant,
  updateReward,
  softDeleteReward,
  restoreReward,
  hardDeleteReward
};
