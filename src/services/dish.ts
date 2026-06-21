import mongoose from 'mongoose';
import { DishModel, IDish } from '../models/dish';
import { RestaurantModel } from '../models/restaurant';
import { CustomerModel } from '../models/customer';
import { PointsWalletModel } from '../models/pointsWallet';
import NotificationService from './notification';
import Logging from '../library/logging';

const createDish = async (data: Partial<IDish>): Promise<IDish> => {
  const dish = new DishModel({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });

  const savedDish = await dish.save();

  if (data.restaurant_id) {
    const restaurant = await RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
      $push: { dishes: savedDish._id }
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
            type: 'new_dish',
            title: `Nou plat a ${restaurantName}!`,
            message: `S'ha afegit un nou plat: "${savedDish.name}". Vine a provar-lo!`,
            data: {
              dish_id: savedDish._id as any
            }
          });
        } catch (innerErr: any) {
          Logging.error(`Failed to send new dish notification to customer ${customerId}:`, innerErr?.message || innerErr);
        }
      }
    } catch (err: any) {
      Logging.error('Error sending new dish notifications:', err?.message || err);
    }
  }

  return savedDish;
};

const getDish = async (dish_id: string): Promise<IDish | null> => {
  return await DishModel.findById(dish_id);
};

const getDeletedDish = async (dish_id: string): Promise<IDish | null> => {
  return await DishModel.findOne({ _id: dish_id, active: false }).lean();
};

const getAllDishes = async (skip: number, limit: number): Promise<{ dishes: IDish[]; total: number }> => {
  const [dishes, total] = await Promise.all([DishModel.find({ active: true }).lean().skip(skip).limit(limit), DishModel.countDocuments({ active: true })]);
  return { dishes, total };
};

const getAllDeletedDishes = async (skip: number, limit: number): Promise<{ dishes: IDish[]; total: number }> => {
  const [dishes, total] = await Promise.all([DishModel.find({ active: false }).lean().skip(skip).limit(limit), DishModel.countDocuments({ active: false })]);
  return { dishes, total };
};

const getByRestaurant = async (restaurant_id: string, skip: number, limit: number): Promise<{ dishes: IDish[]; total: number }> => {
  const query = { restaurant_id, active: true };
  const [dishes, total] = await Promise.all([DishModel.find(query).skip(skip).limit(limit).lean<IDish[]>(), DishModel.countDocuments(query)]);
  return { dishes, total };
};

const getDeletedByRestaurant = async (restaurant_id: string, skip: number, limit: number): Promise<{ dishes: IDish[]; total: number }> => {
  const query = { restaurant_id, active: false };
  const [dishes, total] = await Promise.all([DishModel.find(query).skip(skip).limit(limit).lean<IDish[]>(), DishModel.countDocuments(query)]);
  return { dishes, total };
};

const updateDish = async (dish_id: string, data: Partial<IDish>): Promise<IDish | null> => {
  const dish = await DishModel.findById(dish_id);

  if (dish) {
    dish.set(data);
    return await dish.save();
  }

  return null;
};

const softDeleteDish = async (dish_id: string): Promise<IDish | null> => {
  return await DishModel.findByIdAndUpdate(dish_id, { active: false }, { new: true }).lean();
};

const restoreDish = async (dish_id: string): Promise<IDish | null> => {
  return await DishModel.findByIdAndUpdate(dish_id, { active: true }, { new: true }).lean();
};

const hardDeleteDish = async (dish_id: string): Promise<IDish | null> => {
  const deletedDish = await DishModel.findByIdAndDelete(dish_id);

  if (deletedDish && deletedDish.restaurant_id) {
    await RestaurantModel.findByIdAndUpdate(deletedDish.restaurant_id, {
      $pull: { dishes: deletedDish._id }
    });
  }

  return deletedDish;
};

export default {
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
