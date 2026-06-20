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
const rewardRedemption_1 = __importDefault(require("../services/rewardRedemption"));
const pagination_1 = require("../utils/pagination");
const createRewardRedemption = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saved = yield rewardRedemption_1.default.createRewardRedemption(req.body);
        return res.status(201).json(saved);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const redeemReward = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield rewardRedemption_1.default.redeemReward(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 500).json({
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Error redeeming reward'
        });
    }
});
const readRewardRedemption = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { redemptionId } = req.params;
    try {
        const redemption = yield rewardRedemption_1.default.getRewardRedemption(redemptionId);
        return redemption ? res.status(200).json(redemption) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { redemptions, total } = yield rewardRedemption_1.default.getAllRewardRedemptions(skip, limit);
        return res.status(200).json({
            data: redemptions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readByCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { redemptions, total } = yield rewardRedemption_1.default.getByCustomer(customer_id, skip, limit);
        return res.status(200).json({
            data: redemptions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readByRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurant_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { redemptions, total } = yield rewardRedemption_1.default.getByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: redemptions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readByEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employee_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { redemptions, total } = yield rewardRedemption_1.default.getByEmployee(employee_id, skip, limit);
        return res.status(200).json({
            data: redemptions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readByReward = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reward_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { redemptions, total } = yield rewardRedemption_1.default.getByReward(reward_id, skip, limit);
        return res.status(200).json({
            data: redemptions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const updateStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { redemptionId } = req.params;
    const { status, employee_id, notes } = req.body;
    try {
        const updated = yield rewardRedemption_1.default.updateStatus(redemptionId, {
            status,
            employee_id,
            notes
        });
        return updated ? res.status(200).json(updated) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const updateRewardRedemption = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { redemptionId } = req.params;
    try {
        const updated = yield rewardRedemption_1.default.updateRewardRedemption(redemptionId, req.body);
        return updated ? res.status(200).json(updated) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const deleteRewardRedemption = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { redemptionId } = req.params;
    try {
        const redemption = yield rewardRedemption_1.default.deleteRewardRedemption(redemptionId);
        return redemption ? res.status(200).json(redemption) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.default = {
    createRewardRedemption,
    redeemReward,
    readRewardRedemption,
    readAll,
    readByCustomer,
    readByRestaurant,
    readByEmployee,
    readByReward,
    updateStatus,
    updateRewardRedemption,
    deleteRewardRedemption
};
//# sourceMappingURL=rewardRedemption.js.map