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
const badge_1 = require("../models/badge");
const createBadge = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = new badge_1.BadgeModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    return yield badge.save();
});
const getAllBadges = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [badges, total] = yield Promise.all([badge_1.BadgeModel.find({ deletedAt: null }).skip(skip).limit(limit), badge_1.BadgeModel.countDocuments({ deletedAt: null })]);
    return { badges, total };
});
const getAllDeletedBadges = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [badges, total] = yield Promise.all([
        badge_1.BadgeModel.find({ deletedAt: { $ne: null } })
            .skip(skip)
            .limit(limit),
        badge_1.BadgeModel.countDocuments({ deletedAt: { $ne: null } })
    ]);
    return { badges, total };
});
const getByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, deletedAt: null };
    const [badges, total] = yield Promise.all([badge_1.BadgeModel.find(query).skip(skip).limit(limit).lean(), badge_1.BadgeModel.countDocuments(query)]);
    return { badges, total };
});
const getDeletedByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, deletedAt: { $ne: null } };
    const [badges, total] = yield Promise.all([badge_1.BadgeModel.find(query).skip(skip).limit(limit).lean(), badge_1.BadgeModel.countDocuments(query)]);
    return { badges, total };
});
const getByCustomer = (customer_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { customer_id, deletedAt: null };
    const [badges, total] = yield Promise.all([badge_1.BadgeModel.find(query).skip(skip).limit(limit).lean(), badge_1.BadgeModel.countDocuments(query)]);
    return { badges, total };
});
const getDeletedByCustomer = (customer_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { customer_id, deletedAt: { $ne: null } };
    const [badges, total] = yield Promise.all([badge_1.BadgeModel.find(query).skip(skip).limit(limit).lean(), badge_1.BadgeModel.countDocuments(query)]);
    return { badges, total };
});
const getBadge = (badge_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield badge_1.BadgeModel.findById(badge_id);
});
const getDeletedBadge = (badge_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield badge_1.BadgeModel.findOne({ _id: badge_id, deletedAt: { $ne: null } });
});
const updateBadge = (badge_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_1.BadgeModel.findById(badge_id);
    if (badge) {
        badge.set(data);
        return yield badge.save();
    }
    return null;
});
const softDeleteBadge = (badge_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield badge_1.BadgeModel.findByIdAndUpdate(badge_id, { deletedAt: new Date() }, { new: true }).lean();
});
const restoreBadge = (badge_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield badge_1.BadgeModel.findByIdAndUpdate(badge_id, { deletedAt: null }, { new: true }).lean();
});
const hardDeleteBadge = (badge_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield badge_1.BadgeModel.findByIdAndDelete(badge_id);
});
exports.default = {
    createBadge,
    getAllBadges,
    getAllDeletedBadges,
    getBadge,
    getDeletedBadge,
    getByCustomer,
    getDeletedByCustomer,
    getByRestaurant,
    getDeletedByRestaurant,
    updateBadge,
    softDeleteBadge,
    restoreBadge,
    hardDeleteBadge
};
//# sourceMappingURL=badge.js.map