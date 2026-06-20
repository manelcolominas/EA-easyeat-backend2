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
const statistics_1 = __importDefault(require("../services/statistics"));
const visit_1 = require("../models/visit");
const pagination_1 = require("../utils/pagination");
const getRestaurantObjectId = (req) => {
    const restaurantId = (req.query.restaurant_id || req.params.restaurant_id);
    if (!restaurantId || !mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
        return null;
    }
    return new mongoose_1.default.Types.ObjectId(restaurantId);
};
const buildVisitMatch = (restaurantId) => ({
    restaurant_id: restaurantId,
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
});
const createStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saved = yield statistics_1.default.createStatistics(req.body);
        return res.status(201).json(saved);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { statistics_id } = req.params;
    try {
        const statistics = yield statistics_1.default.getStatistics(statistics_id);
        return statistics ? res.status(200).json(statistics) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { statistics, total } = yield statistics_1.default.getAllStatistics(skip, limit);
        return res.status(200).json({
            data: statistics,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readByRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurant_id } = req.params;
    try {
        const statistics = yield statistics_1.default.getByRestaurant(restaurant_id);
        return statistics ? res.status(200).json(statistics) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const updateStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { statistics_id } = req.params;
    try {
        const updated = yield statistics_1.default.updateStatistics(statistics_id, req.body);
        return updated ? res.status(201).json(updated) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const deleteStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { statistics_id } = req.params;
    try {
        const statistics = yield statistics_1.default.deleteStatistics(statistics_id);
        return statistics ? res.status(200).json(statistics) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const visitsPerHour = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const restaurantObjectId = getRestaurantObjectId(req);
    if (!restaurantObjectId) {
        return res.status(400).json({ message: 'restaurant_id query param is required and must be a valid ObjectId' });
    }
    try {
        const data = yield visit_1.VisitModel.aggregate([
            { $match: buildVisitMatch(restaurantObjectId) },
            {
                $group: {
                    _id: { $hour: '$date' },
                    visits: { $sum: 1 }
                }
            },
            { $project: { _id: 0, hour: '$_id', visits: 1 } },
            { $sort: { hour: 1 } }
        ]);
        return res.status(200).json({ data });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const averagePoints = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const restaurantObjectId = getRestaurantObjectId(req);
    if (!restaurantObjectId) {
        return res.status(400).json({ message: 'restaurant_id query param is required and must be a valid ObjectId' });
    }
    try {
        const [result] = yield visit_1.VisitModel.aggregate([
            { $match: buildVisitMatch(restaurantObjectId) },
            {
                $group: {
                    _id: null,
                    averagePoints: { $avg: '$pointsEarned' },
                    totalVisits: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    averagePoints: { $ifNull: ['$averagePoints', 0] },
                    totalVisits: 1
                }
            }
        ]);
        return res.status(200).json({
            data: {
                averagePoints: (_a = result === null || result === void 0 ? void 0 : result.averagePoints) !== null && _a !== void 0 ? _a : 0,
                totalVisits: (_b = result === null || result === void 0 ? void 0 : result.totalVisits) !== null && _b !== void 0 ? _b : 0
            }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const loyalCustomers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const restaurantObjectId = getRestaurantObjectId(req);
    const minVisits = Number.parseInt(req.query.minVisits || '3', 10);
    if (!restaurantObjectId) {
        return res.status(400).json({ message: 'restaurant_id query param is required and must be a valid ObjectId' });
    }
    if (!Number.isFinite(minVisits) || minVisits < 1) {
        return res.status(400).json({ message: 'minVisits must be an integer greater than 0' });
    }
    try {
        const [result] = yield visit_1.VisitModel.aggregate([
            { $match: buildVisitMatch(restaurantObjectId) },
            {
                $group: {
                    _id: '$customer_id',
                    visits: { $sum: 1 }
                }
            },
            { $match: { visits: { $gt: minVisits } } },
            {
                $group: {
                    _id: null,
                    loyalCustomers: { $sum: 1 }
                }
            },
            { $project: { _id: 0, loyalCustomers: 1 } }
        ]);
        return res.status(200).json({
            data: {
                loyalCustomers: (_a = result === null || result === void 0 ? void 0 : result.loyalCustomers) !== null && _a !== void 0 ? _a : 0,
                minVisits
            }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.default = {
    createStatistics,
    readStatistics,
    readAll,
    readByRestaurant,
    updateStatistics,
    deleteStatistics,
    visitsPerHour,
    averagePoints,
    loyalCustomers
};
//# sourceMappingURL=statistics.js.map