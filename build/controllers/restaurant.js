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
const restaurant_js_1 = __importDefault(require("../services/restaurant.js"));
const pagination_1 = require("../utils/pagination");
// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────
const createRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saved = yield restaurant_js_1.default.createRestaurant(req.body);
        return res.status(201).json(saved);
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({
                message: 'A restaurant with this name already exists in this city.',
                error
            });
        }
        if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError') {
            return res.status(422).json({
                message: 'Validation failed',
                error: error.errors || error.message
            });
        }
        return res.status(500).json({ error });
    }
});
const readRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.getRestaurant(req.params.restaurantId);
        return restaurant ? res.status(200).json(restaurant) : res.status(404).json({ message: 'Restaurant not found.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDeletedRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.getDeletedRestaurant(req.params.restaurantId);
        return restaurant ? res.status(200).json(restaurant) : res.status(404).json({ message: 'Deleted restaurant not found.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { restaurants, total } = yield restaurant_js_1.default.getAllRestaurants(skip, limit);
        return res.status(200).json({
            data: restaurants,
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
        const { restaurants, total } = yield restaurant_js_1.default.getAllDeletedRestaurants(skip, limit);
        return res.status(200).json({
            data: restaurants,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const updateRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.updateRestaurant(req.params.restaurantId, req.body);
        return restaurant ? res.status(200).json(restaurant) : res.status(404).json({ message: 'Restaurant not found.' });
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({
                message: 'A restaurant with this name already exists in this city.',
                error
            });
        }
        if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError') {
            return res.status(422).json({
                message: 'Validation failed',
                error: error.errors || error.message
            });
        }
        return res.status(500).json({ error });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// Delete / restore
// ─────────────────────────────────────────────────────────────────────────────
/**
 * DELETE /restaurants/:restaurant_id/soft
 * Sets deletedAt = now. The restaurant disappears from all normal queries.
 * Returns 404 if already soft-deleted or not found.
 */
const softDelete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.softDeleteRestaurant(req.params.restaurantId);
        return restaurant ? res.status(200).json({ message: 'Restaurant deactivated.', restaurant }) : res.status(404).json({ message: 'Restaurant not found or already deactivated.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
/**
 * PATCH /restaurants/:restaurant_id/restore
 * Clears deletedAt, making the restaurant visible again.
 * Returns 404 if the restaurant is not found or is already active.
 */
const restore = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.restoreRestaurant(req.params.restaurantId);
        return restaurant ? res.status(200).json({ message: 'Restaurant restored.', restaurant }) : res.status(404).json({ message: 'Restaurant not found or already active.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
/**
 * DELETE /restaurants/:restaurant_id/hard
 * Permanently removes the document from the database. Irreversible.
 * Use only for admin operations or GDPR erasure requests.
 */
const hardDelete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.hardDeleteRestaurant(req.params.restaurantId);
        return restaurant ? res.status(200).json({ message: 'Restaurant permanently deleted.', restaurant }) : res.status(404).json({ message: 'Restaurant not found.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// Read variants
// ─────────────────────────────────────────────────────────────────────────────
const getRestaurantCustomers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { customers, total } = yield restaurant_js_1.default.getRestaurantCustomers(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantCustomers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { customers, total } = yield restaurant_js_1.default.getDeletedRestaurantCustomers(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getRestaurantFull = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.getRestaurantFull(req.params.restaurantId);
        return restaurant ? res.status(200).json(restaurant) : res.status(404).json({ message: 'Restaurant not found.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getRestaurantDetailedForCustomerFrontend = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.getRestaurantDetailedForCustomerFrontend(req.params.restaurantId);
        return restaurant ? res.status(200).json(restaurant) : res.status(404).json({ message: 'Restaurant not found.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantFull = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurant = yield restaurant_js_1.default.getDeletedRestaurantFull(req.params.restaurantId);
        return restaurant ? res.status(200).json(restaurant) : res.status(404).json({ message: 'Deleted restaurant not found.' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getRestaurantsNearby = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { lng, lat, maxDistance } = req.query;
    if (!lng || !lat)
        return res.status(400).json({ message: 'lng and lat query params are required.' });
    try {
        const restaurants = yield restaurant_js_1.default.getReestaurantsNearby(parseFloat(lng), parseFloat(lat), maxDistance ? parseFloat(maxDistance) : 5000);
        return res.status(200).json(restaurants);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getBadges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { badges, total } = yield restaurant_js_1.default.getBadges(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantBadges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { badges, total } = yield restaurant_js_1.default.getDeletedRestaurantBadges(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statistics = yield restaurant_js_1.default.getStatistics(req.params.restaurantId);
        return res.status(200).json(statistics);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statistics = yield restaurant_js_1.default.getDeletedRestaurantStatistics(req.params.restaurantId);
        return res.status(200).json(statistics);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getTopDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurantId = req.params.restaurantId;
        const topDish = yield restaurant_js_1.default.getTopDishByRestaurant(restaurantId);
        if (!topDish) {
            return res.status(404).json({ message: 'No rated dishes found for this restaurant.' });
        }
        return res.status(200).json({
            name: topDish.name,
            averageRating: topDish.averageRating,
            totalRatings: topDish.totalRatings
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getFiltered = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lng, lat, radiusMeters, categories, minGlobalRating, city, openNow, openAt } = req.query;
        const results = yield restaurant_js_1.default.getFilteredRestaurants({
            lng: lng ? parseFloat(lng) : undefined,
            lat: lat ? parseFloat(lat) : undefined,
            radiusMeters: radiusMeters ? parseFloat(radiusMeters) : undefined,
            categories: categories ? categories.split(',') : undefined,
            minGlobalRating: minGlobalRating ? parseFloat(minGlobalRating) : undefined,
            city: city ? city : undefined,
            openNow: openNow === 'true',
            openAt: openAt ? openAt : undefined
        });
        return res.status(200).json(results);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getEmployees = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { employees, total } = yield restaurant_js_1.default.getEmployees(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: employees,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantEmployees = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { employees, total } = yield restaurant_js_1.default.getDeletedRestaurantEmployees(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: employees,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDishes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { dishes, total } = yield restaurant_js_1.default.getDishes(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: dishes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantDishes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { dishes, total } = yield restaurant_js_1.default.getDeletedRestaurantDishes(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: dishes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getRewards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { rewards, total } = yield restaurant_js_1.default.getRewards(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: rewards,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantRewards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { rewards, total } = yield restaurant_js_1.default.getDeletedRestaurantRewards(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: rewards,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getVisits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield restaurant_js_1.default.getVisits(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantVisits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { visits, total } = yield restaurant_js_1.default.getDeletedRestaurantVisits(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield restaurant_js_1.default.getReviews(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const getDeletedRestaurantReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield restaurant_js_1.default.getDeletedRestaurantReviews(req.params.restaurantId, skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
exports.default = {
    createRestaurant,
    readRestaurant,
    readDeletedRestaurant,
    readAll,
    readAllDeleted,
    updateRestaurant,
    softDelete,
    restore,
    hardDelete,
    getRestaurantCustomers,
    getDeletedRestaurantCustomers,
    getRestaurantFull,
    getRestaurantDetailedForCustomerFrontend,
    getDeletedRestaurantFull,
    getRestaurantsNearby,
    getBadges,
    getDeletedRestaurantBadges,
    getStatistics,
    getDeletedRestaurantStatistics,
    getTopDish,
    getFiltered,
    getEmployees,
    getDeletedRestaurantEmployees,
    getDishes,
    getDeletedRestaurantDishes,
    getRewards,
    getDeletedRestaurantRewards,
    getVisits,
    getDeletedRestaurantVisits,
    getReviews,
    getDeletedRestaurantReviews
};
//# sourceMappingURL=restaurant.js.map