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
const statistics_1 = require("../models/statistics");
const restaurant_1 = require("../models/restaurant");
const createStatistics = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const statistics = new statistics_1.StatisticsModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    const savedStatistics = yield statistics.save();
    if (data.restaurant_id) {
        yield restaurant_1.RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
            statistics: savedStatistics._id
        });
    }
    return savedStatistics;
});
const getStatistics = (statistics_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield statistics_1.StatisticsModel.findById(statistics_id);
});
const getAllStatistics = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [statistics, total] = yield Promise.all([statistics_1.StatisticsModel.find().skip(skip).limit(limit), statistics_1.StatisticsModel.countDocuments()]);
    return { statistics, total };
});
const getByRestaurant = (restaurant_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield statistics_1.StatisticsModel.findOne({ restaurant_id });
});
const updateStatistics = (statistics_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const statistics = yield statistics_1.StatisticsModel.findById(statistics_id);
    if (statistics) {
        statistics.set(data);
        return yield statistics.save();
    }
    return null;
});
const deleteStatistics = (statistics_id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield statistics_1.StatisticsModel.findByIdAndDelete(statistics_id);
    if (deleted && deleted.restaurant_id) {
        yield restaurant_1.RestaurantModel.findByIdAndUpdate(deleted.restaurant_id, {
            $unset: { statistics: '' }
        });
    }
    return deleted;
});
exports.default = { createStatistics, getStatistics, getAllStatistics, getByRestaurant, updateStatistics, deleteStatistics };
//# sourceMappingURL=statistics.js.map