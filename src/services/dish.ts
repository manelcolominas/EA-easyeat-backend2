import mongoose from 'mongoose';
import { DishModel, IDish } from '../models/dish';
import { RestaurantModel } from '../models/restaurant';

const createDish = async (data: Partial<IDish>) => {
    const dish = new DishModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });

    const savedDish = await dish.save();

    if (data.restaurant_id) {
        await RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
            $push: { dishes: savedDish._id }
        });
    }

    return savedDish;
};

const getDish = async (dish_id: string) => {
    return await DishModel.findById(dish_id);
};

const getAllDishes = async (): Promise<IDish[]> => {
    return await DishModel.find();
};

const updateDish = async (dish_id: string, data: Partial<IDish>) => {
    const dish = await DishModel.findById(dish_id);

    if (dish) {
        dish.set(data);
        return await dish.save();
    }

    return null;
};

const deleteDish = async (dish_id: string) => {
    const deletedDish = await DishModel.findByIdAndDelete(dish_id);

    if (deletedDish && deletedDish.restaurant_id) {
        await RestaurantModel.findByIdAndUpdate(deletedDish.restaurant_id, {
            $pull: { dishes: deletedDish._id }
        });
    }

    return deletedDish;
};

export default { createDish, getDish, getAllDishes, updateDish, deleteDish };
