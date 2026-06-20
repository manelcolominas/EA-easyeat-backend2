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
const badge_1 = __importDefault(require("../services/badge"));
const pagination_1 = require("../utils/pagination");
const createBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedBadge = yield badge_1.default.createBadge(req.body);
        return res.status(201).json(savedBadge);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const badge_id = req.params.badge_id;
    try {
        const badge = yield badge_1.default.getBadge(badge_id);
        return badge ? res.status(200).json(badge) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDeletedBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const badge_id = req.params.badge_id;
    try {
        const badge = yield badge_1.default.getDeletedBadge(badge_id);
        return badge ? res.status(200).json(badge) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { badges, total } = yield badge_1.default.getAllBadges(skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readAllDeleted = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { badges, total } = yield badge_1.default.getAllDeletedBadges(skip, limit);
        return res.status(200).json({
            data: badges,
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
        const { badges, total } = yield badge_1.default.getByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDeletedByRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurant_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { badges, total } = yield badge_1.default.getDeletedByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: badges,
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
        const { badges, total } = yield badge_1.default.getByCustomer(customer_id, skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDeletedByCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { badges, total } = yield badge_1.default.getDeletedByCustomer(customer_id, skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const updateBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const badge_id = req.params.badge_id;
    try {
        const updatedBadge = yield badge_1.default.updateBadge(badge_id, req.body);
        return updatedBadge ? res.status(201).json(updatedBadge) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const softDeleteBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const badge_id = req.params.badge_id;
    try {
        const badge = yield badge_1.default.softDeleteBadge(badge_id);
        return badge ? res.status(200).json(badge) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const restoreBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const badge_id = req.params.badge_id;
    try {
        const badge = yield badge_1.default.restoreBadge(badge_id);
        return badge ? res.status(200).json(badge) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const hardDeleteBadge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const badge_id = req.params.badge_id;
    try {
        const badge = yield badge_1.default.hardDeleteBadge(badge_id);
        return badge ? res.status(200).json(badge) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.default = {
    createBadge,
    readBadge,
    readDeletedBadge,
    readAll,
    readAllDeleted,
    readByRestaurant,
    readDeletedByRestaurant,
    readByCustomer,
    readDeletedByCustomer,
    updateBadge,
    softDeleteBadge,
    restoreBadge,
    hardDeleteBadge
};
//# sourceMappingURL=badge.js.map