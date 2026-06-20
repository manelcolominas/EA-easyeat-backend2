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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const visit_1 = require("../models/visit");
const pointsRedemption_1 = require("../utils/pointsRedemption");
const createVisit = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id, pointsEarned, deletedAt } = data, visitData = __rest(data, ["_id", "pointsEarned", "deletedAt"]);
    return yield (0, pointsRedemption_1.pointsRedemption)(visitData);
});
const getVisit = (visit_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield visit_1.VisitModel.findById(visit_id).populate('customer_id', 'name email').populate('restaurant_id', 'profile.name profile.location.city profile.location.address');
});
const getDeletedVisit = (visit_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield visit_1.VisitModel.findOne({ _id: visit_id, deletedAt: { $ne: null } })
        .populate('customer_id', 'name email')
        .populate('restaurant_id', 'profile.name profile.location.city profile.location.address');
});
const getAllVisits = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { deletedAt: null };
    const [visits, total] = yield Promise.all([
        visit_1.VisitModel.find(query)
            .populate('customer_id', 'name email')
            .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        visit_1.VisitModel.countDocuments(query)
    ]);
    return { visits, total };
});
const getAllDeletedVisits = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { deletedAt: { $ne: null } };
    const [visits, total] = yield Promise.all([
        visit_1.VisitModel.find(query)
            .populate('customer_id', 'name email')
            .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        visit_1.VisitModel.countDocuments(query)
    ]);
    return { visits, total };
});
const getByCustomer = (customer_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { customer_id, deletedAt: null };
    const [visits, total] = yield Promise.all([
        visit_1.VisitModel.find(query).populate('restaurant_id', 'profile.name profile.location.city profile.location.address').sort({ date: -1 }).skip(skip).limit(limit).lean(),
        visit_1.VisitModel.countDocuments(query)
    ]);
    return { visits, total };
});
const getDeletedByCustomer = (customer_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { customer_id, deletedAt: { $ne: null } };
    const [visits, total] = yield Promise.all([
        visit_1.VisitModel.find(query).populate('restaurant_id', 'profile.name profile.location.city profile.location.address').sort({ date: -1 }).skip(skip).limit(limit).lean(),
        visit_1.VisitModel.countDocuments(query)
    ]);
    return { visits, total };
});
const getByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, deletedAt: null };
    const [visits, total] = yield Promise.all([
        visit_1.VisitModel.find(query).populate('customer_id', 'name email').sort({ date: -1 }).skip(skip).limit(limit).lean(),
        visit_1.VisitModel.countDocuments(query)
    ]);
    return { visits, total };
});
const getDeletedByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, deletedAt: { $ne: null } };
    const [visits, total] = yield Promise.all([
        visit_1.VisitModel.find(query).populate('customer_id', 'name email').sort({ date: -1 }).skip(skip).limit(limit).lean(),
        visit_1.VisitModel.countDocuments(query)
    ]);
    return { visits, total };
});
const updateVisit = (visit_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const visit = yield visit_1.VisitModel.findById(visit_id);
    if (visit) {
        visit.set(data);
        return yield visit.save();
    }
    return null;
});
const softDeleteVisit = (visit_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield visit_1.VisitModel.findByIdAndUpdate(visit_id, { deletedAt: new Date() }, { new: true }).lean();
});
const restoreVisit = (visit_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield visit_1.VisitModel.findByIdAndUpdate(visit_id, { deletedAt: null }, { new: true }).lean();
});
const hardDeleteVisit = (visit_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield visit_1.VisitModel.findByIdAndDelete(visit_id);
});
exports.default = {
    createVisit,
    getVisit,
    getDeletedVisit,
    getAllVisits,
    getAllDeletedVisits,
    getByCustomer,
    getDeletedByCustomer,
    getByRestaurant,
    getDeletedByRestaurant,
    updateVisit,
    softDeleteVisit,
    restoreVisit,
    hardDeleteVisit
};
//# sourceMappingURL=visit.js.map