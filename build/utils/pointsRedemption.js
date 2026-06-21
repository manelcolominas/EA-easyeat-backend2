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
exports.pointsRedemption = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const visit_1 = require("../models/visit");
const pointsWallet_1 = require("../models/pointsWallet");
const restaurant_1 = require("../models/restaurant");
const calculatePointsExponential = (ownMoney90Days, otherMoney90Days, billAmount, meanMoneySpent90Days, maxPointsVisit) => {
    // Si encara no hi ha prou dades de visites (mitjana de despesa és 0), assignem un 15% del màxim
    if (meanMoneySpent90Days <= 0) {
        return Math.floor(maxPointsVisit * 0.35);
    }
    const moneySpent = ownMoney90Days * 0.375 + otherMoney90Days * 0.125 + billAmount * 0.5;
    const ratio = moneySpent / meanMoneySpent90Days;
    const transformed = 1 - Math.exp(-ratio);
    const pointsToAssign = Math.floor(transformed * maxPointsVisit);
    return pointsToAssign;
};
const calculateTotalSpentInTheRestaurantLasts90Days = (customer_id, restaurant_id) => __awaiter(void 0, void 0, void 0, function* () {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const result = yield visit_1.VisitModel.aggregate([
        {
            $match: {
                customer_id: new mongoose_1.default.Types.ObjectId(customer_id.toString()),
                restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id.toString()),
                date: { $gte: ninetyDaysAgo },
                deletedAt: null
            }
        },
        {
            $group: {
                _id: null,
                totalSpent: { $sum: '$billAmount' }
            }
        }
    ]);
    return result.length > 0 ? result[0].totalSpent : 0;
});
const calculateTotalSpentInOthersRestaurantsLasts90Days = (customer_id, restaurant_id) => __awaiter(void 0, void 0, void 0, function* () {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const result = yield visit_1.VisitModel.aggregate([
        {
            $match: {
                customer_id: new mongoose_1.default.Types.ObjectId(customer_id.toString()),
                restaurant_id: { $ne: new mongoose_1.default.Types.ObjectId(restaurant_id.toString()) },
                date: { $gte: ninetyDaysAgo },
                deletedAt: null
            }
        },
        {
            $group: {
                _id: null,
                totalSpent: { $sum: '$billAmount' }
            }
        }
    ]);
    return result.length > 0 ? result[0].totalSpent : 0;
});
const calculateAverageSpentInARestaurantLast90DaysByTheCustomers = (restaurant_id) => __awaiter(void 0, void 0, void 0, function* () {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const result = yield visit_1.VisitModel.aggregate([
        {
            $match: {
                restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id.toString()),
                date: { $gte: ninetyDaysAgo },
                deletedAt: null
            }
        },
        {
            $group: {
                _id: '$customer_id',
                totalPerCustomer: { $sum: '$billAmount' }
            }
        },
        {
            $group: {
                _id: null,
                avgSpent: { $avg: '$totalPerCustomer' }
            }
        }
    ]);
    return result.length > 0 ? result[0].avgSpent : 0;
});
const calculateAverageSpentInARestaurantLast90DaysByVisits = (restaurant_id) => __awaiter(void 0, void 0, void 0, function* () {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const result = yield visit_1.VisitModel.aggregate([
        {
            $match: {
                restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id.toString()),
                date: { $gte: ninetyDaysAgo },
                deletedAt: null
            }
        },
        {
            $group: {
                _id: null,
                avgSpent: { $avg: '$billAmount' }
            }
        }
    ]);
    return result.length > 0 ? result[0].avgSpent : 0;
});
const pointsRedemption = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id, restaurant_id, billAmount } = data;
    if (!customer_id || !restaurant_id) {
        throw new Error('customer_id and restaurant_id are required');
    }
    const [totalSpentInTheRestaurantLast90Days, totalSpentInOthersRestaurantsLast90Days, averageSpentInARestaurantLast90DaysByTheCustomers, restaurant] = yield Promise.all([
        calculateTotalSpentInTheRestaurantLasts90Days(customer_id, restaurant_id),
        calculateTotalSpentInOthersRestaurantsLasts90Days(customer_id, restaurant_id),
        calculateAverageSpentInARestaurantLast90DaysByTheCustomers(restaurant_id),
        restaurant_1.RestaurantModel.findById(restaurant_id)
    ]);
    if (!restaurant) {
        throw new Error(`Restaurant not found for id: ${restaurant_id}`);
    }
    const pointsSystem = restaurant.profile.pointsSystem || {
        method: 'exponential',
        pointsPerEuro: 10,
        maxPointsVisit: restaurant.profile.maxPointsVisit || 500
    };
    let pointsToAssign = 0;
    if (pointsSystem.method === 'simple') {
        pointsToAssign = Math.floor((billAmount !== null && billAmount !== void 0 ? billAmount : 0) * (pointsSystem.pointsPerEuro || 10));
    }
    else {
        const maxPointsVisit = pointsSystem.maxPointsVisit || restaurant.profile.maxPointsVisit || 500;
        pointsToAssign = calculatePointsExponential(totalSpentInTheRestaurantLast90Days, totalSpentInOthersRestaurantsLast90Days, billAmount !== null && billAmount !== void 0 ? billAmount : 0, averageSpentInARestaurantLast90DaysByTheCustomers, maxPointsVisit);
    }
    const visit = new visit_1.VisitModel(Object.assign(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data), { pointsEarned: pointsToAssign }));
    const savedVisit = yield visit.save();
    yield pointsWallet_1.PointsWalletModel.findOneAndUpdate({ customer_id, restaurant_id }, { $inc: { points: pointsToAssign } }, { upsert: true, new: true });
    return savedVisit;
});
exports.pointsRedemption = pointsRedemption;
//# sourceMappingURL=pointsRedemption.js.map