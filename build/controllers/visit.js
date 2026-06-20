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
const visit_1 = __importDefault(require("../services/visit"));
const pagination_1 = require("../utils/pagination");
const createVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedVisit = yield visit_1.default.createVisit(req.body);
        const response = {
            _id: savedVisit._id,
            customer_id: savedVisit.customer_id,
            restaurant_id: savedVisit.restaurant_id,
            employee_id: savedVisit.employee_id,
            date: savedVisit.date,
            pointsEarned: savedVisit.pointsEarned,
            billAmount: savedVisit.billAmount
        };
        return res.status(201).json(response);
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
const readVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const visit_id = req.params.visit_id;
    try {
        const visit = yield visit_1.default.getVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const readDeletedVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const visit_id = req.params.visit_id;
    try {
        const visit = yield visit_1.default.getDeletedVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield visit_1.default.getAllVisits(skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const readAllDeleted = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield visit_1.default.getAllDeletedVisits(skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const readByCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield visit_1.default.getByCustomer(customer_id, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const readDeletedByCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield visit_1.default.getDeletedByCustomer(customer_id, skip, limit);
        return res.status(200).json({
            data: visits,
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
        const { visits, total } = yield visit_1.default.getByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: visits,
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
        const { visits, total } = yield visit_1.default.getDeletedByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const updateVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const visit_id = req.params.visit_id;
    try {
        const updatedVisit = yield visit_1.default.updateVisit(visit_id, req.body);
        return updatedVisit ? res.status(200).json(updatedVisit) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const softDeleteVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const visit_id = req.params.visit_id;
    try {
        const visit = yield visit_1.default.softDeleteVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const restoreVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const visit_id = req.params.visit_id;
    try {
        const visit = yield visit_1.default.restoreVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
const hardDeleteVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const visit_id = req.params.visit_id;
    try {
        const visit = yield visit_1.default.hardDeleteVisit(visit_id);
        return visit ? res.status(200).json(visit) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = {
    createVisit,
    readVisit,
    readDeletedVisit,
    readAll,
    readAllDeleted,
    readByCustomer,
    readDeletedByCustomer,
    readByRestaurant,
    readDeletedByRestaurant,
    updateVisit,
    softDeleteVisit,
    restoreVisit,
    hardDeleteVisit
};
//# sourceMappingURL=visit.js.map