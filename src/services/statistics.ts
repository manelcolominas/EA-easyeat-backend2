import mongoose from 'mongoose';
import { StatisticsModel, IStatistics } from '../models/statistics';
import { RestaurantModel } from '../models/restaurant';

const createStatistics = async (data: Partial<IStatistics>) => {
    const statistics = new StatisticsModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });

    const savedStatistics = await statistics.save();

    if (data.restaurant_id) {
        await RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
            statistics: savedStatistics._id
        });
    }

    return savedStatistics;
};

const getStatistics = async (statistics_id: string) => {
    return await StatisticsModel.findById(statistics_id);
};

const getAllStatistics = async (skip: number, limit: number): Promise<{ statistics: IStatistics[], total: number }> => {
    const [statistics, total] = await Promise.all([
    StatisticsModel.find().skip(skip).limit(limit),
        StatisticsModel.countDocuments()
    ]);
    return { statistics, total };
};

const getByRestaurant = async (restaurant_id: string) => {
    return await StatisticsModel.findOne({ restaurant_id });
};

const updateStatistics = async (statistics_id: string, data: Partial<IStatistics>) => {
    const statistics = await StatisticsModel.findById(statistics_id);

    if (statistics) {
        statistics.set(data);
        return await statistics.save();
    }

    return null;
};

const deleteStatistics = async (statistics_id: string) => {
    const deleted = await StatisticsModel.findByIdAndDelete(statistics_id);

    if (deleted && deleted.restaurant_id) {
        await RestaurantModel.findByIdAndUpdate(deleted.restaurant_id, {
            $unset: { statistics: '' }
        });
    }

    return deleted;
};

export default { createStatistics, getStatistics, getAllStatistics, getByRestaurant, updateStatistics, deleteStatistics };
