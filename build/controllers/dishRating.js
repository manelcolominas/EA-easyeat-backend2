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
const dishRating_1 = __importDefault(require("../services/dishRating"));
const pagination_1 = require("../utils/pagination");
// ─── Create or update a rating ────────────────────────────────────────────────
/**
 * POST /dish-ratings
 * Authenticated customers may only submit a rating under their own customer_id.
 * Admins may submit on behalf of any customer.
 */
const rateOrUpdateDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { customer_id, dish_id, rating } = req.body;
    // Enforce ownership: customer can only rate as themselves
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== customer_id) {
        return res.status(403).json({ message: 'Access denied: you can only rate as yourself' });
    }
    try {
        const result = yield dishRating_1.default.rateOrUpdateDish(customer_id, dish_id, rating);
        if (!result) {
            return res.status(404).json({ message: 'Dish not found or not active' });
        }
        return res.status(result.isNew ? 201 : 200).json(result.data);
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({ message: 'A rating already exists for this customer and dish.' });
        }
        return res.status(500).json({ error });
    }
});
// ─── Get ratings for a dish (paginated) ──────────────────────────────────────
const readByDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { dishRatings, total } = yield dishRating_1.default.getRatingsByDish(dish_id, skip, limit);
        return res.status(200).json({
            data: dishRatings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Get ratings for a customer (paginated) ──────────────────────────────────
const readByCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { dishRatings, total } = yield dishRating_1.default.getRatingsByCustomer(customer_id, skip, limit);
        return res.status(200).json({
            data: dishRatings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Soft delete a rating ─────────────────────────────────────────────────────
/**
 * DELETE /dish-ratings/:id/soft
 * Customers can only delete their own rating. Admins can delete any.
 */
const softDeleteRating = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    // Non-admin customers may only delete their own rating
    const customer_id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin' ? undefined : (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    try {
        const result = yield dishRating_1.default.softDeleteRating(id, customer_id);
        return result ? res.status(200).json({ message: 'Rating deleted', result }) : res.status(404).json({ message: 'Rating not found or already deleted' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─── Rating summary for a dish ────────────────────────────────────────────────
const getRatingSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const summary = yield dishRating_1.default.getDishRatingSummary(dish_id);
        return res.status(200).json(summary);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getTopDishByRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurant_id } = req.params;
    try {
        const result = yield dishRating_1.default.getTopDishByRestaurant(restaurant_id);
        if (!result) {
            return res.status(404).json({ message: 'No ratings yet' });
        }
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getTopDishesByRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurant_id } = req.params;
    try {
        const result = yield dishRating_1.default.getTopDishesByRestaurant(restaurant_id);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.default = {
    rateOrUpdateDish,
    readByDish,
    readByCustomer,
    softDeleteRating,
    getRatingSummary,
    getTopDishByRestaurant,
    getTopDishesByRestaurant
};
//# sourceMappingURL=dishRating.js.map