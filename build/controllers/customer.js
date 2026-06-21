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
const customer_1 = __importDefault(require("../services/customer"));
const pagination_1 = require("../utils/pagination");
// ─── Create ───────────────────────────────────────────────────────────────────
const createCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedCustomer = yield customer_1.default.createCustomer(req.body);
        return res.status(201).json(savedCustomer);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Read (single) ────────────────────────────────────────────────────────────
const readCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const customer = yield customer_1.default.getCustomer(customer_id);
        return customer ? res.status(200).json(customer) : res.status(404).json({ message: 'Customer not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDeletedCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const customer = yield customer_1.default.getDeletedCustomer(customer_id);
        return customer ? res.status(200).json(customer) : res.status(404).json({ message: 'Customer not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readCustomerFull = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const customer = yield customer_1.default.getCustomerFull(customer_id);
        return customer ? res.status(200).json(customer) : res.status(404).json({ message: 'Customer not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDeletedCustomerFull = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const customer = yield customer_1.default.getDeletedCustomerFull(customer_id);
        return customer ? res.status(200).json(customer) : res.status(404).json({ message: 'Customer not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getCustomerAllBadges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { badges, total } = yield customer_1.default.getCustomerAllBadges(customer_id, skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getCustomerAllFavouriteRestaurants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { favoriteRestaurants, total } = yield customer_1.default.getCustomerAllFavouriteRestaurants(customer_id, skip, limit);
        return res.status(200).json({
            data: favoriteRestaurants,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getCustomerAllReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield customer_1.default.getCustomerAllReviews(customer_id, skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getCustomerAllVisits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield customer_1.default.getCustomerAllVisits(customer_id, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getCustomerAllDeletedVisits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield customer_1.default.getCustomerAllDeletedVisits(customer_id, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getCustomerAllPointsWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { pointsWallet, total } = yield customer_1.default.getCustomerAllPointsWallet(customer_id, skip, limit);
        return res.status(200).json({
            data: pointsWallet,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getCustomersByRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurant_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { customers, total } = yield customer_1.default.getCustomersByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Read (paginated list) ────────────────────────────────────────────────────
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { data, total } = yield customer_1.default.getAllCustomers(skip, limit);
        return res.status(200).json({
            data,
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
        const { data, total } = yield customer_1.default.getAllDeletedCustomers(skip, limit);
        return res.status(200).json({
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Update ───────────────────────────────────────────────────────────────────
const updateCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const updatedCustomer = yield customer_1.default.updateCustomer(customer_id, req.body);
        return updatedCustomer ? res.status(200).json(updatedCustomer) : res.status(404).json({ message: 'Customer not found or already deleted' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Soft Delete ──────────────────────────────────────────────────────────────
/**
 * DELETE /customers/:customer_id
 * Marks the customer as inactive without removing the document.
 */
const softDeleteCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const customer = yield customer_1.default.softDeleteCustomer(customer_id);
        return customer ? res.status(200).json({ message: 'Customer deactivated', customer }) : res.status(404).json({ message: 'Customer not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Restore ─────────────────────────────────────────────────────────────────
/**
 * PATCH /customers/:customer_id/restore
 * Reverses a soft-delete, making the customer active again.
 */
const restoreCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const customer = yield customer_1.default.restoreCustomer(customer_id);
        return customer ? res.status(200).json({ message: 'Customer restored', customer }) : res.status(404).json({ message: 'Customer not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Hard Delete (admin only) ─────────────────────────────────────────────────
/**
 * DELETE /customers/:customer_id/hard
 * Permanently removes the document. Requires admin privileges.
 */
const hardDeleteCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const customer = yield customer_1.default.hardDeleteCustomer(customer_id);
        return customer ? res.status(200).json({ message: 'Customer permanently deleted' }) : res.status(404).json({ message: 'Customer not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.default = {
    createCustomer,
    readCustomer,
    readDeletedCustomer,
    readCustomerFull,
    readDeletedCustomerFull,
    getCustomerAllBadges,
    getCustomerAllFavouriteRestaurants,
    getCustomerAllPointsWallet,
    getCustomerAllReviews,
    getCustomerAllVisits,
    getCustomerAllDeletedVisits,
    getCustomersByRestaurant,
    readAll,
    readAllDeleted,
    updateCustomer,
    softDeleteCustomer,
    restoreCustomer,
    hardDeleteCustomer
};
//# sourceMappingURL=customer.js.map