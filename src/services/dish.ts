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

const getDeletedDish = async (dish_id: string) => {
    return await DishModel.findOne({ _id: dish_id, active: false }).lean();
};

const getAllDishes = async (skip: number, limit: number): Promise<{ dishes: IDish[], total: number }> => {
    const [dishes, total] = await Promise.all([
        DishModel.find({ active: true }).lean().skip(skip).limit(limit),
        DishModel.countDocuments({ active: true })
    ]);
    return { dishes, total };
};

const getAllDeletedDishes = async (skip: number, limit: number): Promise<{ dishes: IDish[], total: number }> => {
    const [dishes, total] = await Promise.all([
        DishModel.find({ active: false }).lean().skip(skip).limit(limit),
        DishModel.countDocuments({ active: false })
    ]);
    return { dishes, total };
};

const updateDish = async (dish_id: string, data: Partial<IDish>) => {
    const dish = await DishModel.findById(dish_id);

    if (dish) {
        dish.set(data);
        return await dish.save();
    }

    return null;
};

const softDeleteDish = async (dish_id: string) => {
    return await DishModel.findByIdAndUpdate(dish_id, { active: false }, { new: true }).lean();
};

const restoreDish = async (dish_id: string) => {
    return await DishModel.findByIdAndUpdate(dish_id, { active: true }, { new: true }).lean();
};

const hardDeleteDish = async (dish_id: string) => {
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
    updateDish,
    softDeleteDish,
    restoreDish,
    hardDeleteDish,
};
