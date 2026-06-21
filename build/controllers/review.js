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
const review_1 = __importDefault(require("../services/review"));
const pagination_1 = require("../utils/pagination");
// Create review
const createReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedReview = yield review_1.default.createReview(req.body);
        return res.status(201).json(savedReview);
    }
    catch (error) {
        return next(error);
    }
});
// Obtain a review by ID
const readReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_1.default.getReview(req.params.review_id);
        return review ? res.status(200).json(review) : res.status(404).json({ message: 'Review not found' });
    }
    catch (error) {
        return next(error);
    }
});
const readDeletedReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_1.default.getDeletedReview(req.params.review_id);
        return review ? res.status(200).json(review) : res.status(404).json({ message: 'Review not found' });
    }
    catch (error) {
        return next(error);
    }
});
// Obtain all reviews
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield review_1.default.getAllReviews(skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return next(error);
    }
});
const readAllDeleted = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield review_1.default.getAllDeletedReviews(skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return next(error);
    }
});
// Update review
const updateReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedReview = yield review_1.default.updateReview(req.params.review_id, req.body);
        return updatedReview ? res.status(200).json(updatedReview) : res.status(404).json({ message: 'Review not found' });
    }
    catch (error) {
        return next(error);
    }
});
// Delete review
const softDeleteReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield review_1.default.softDeleteReview(req.params.review_id);
        return deleted ? res.status(200).json({ message: 'Review deleted' }) : res.status(404).json({ message: 'Review not found' });
    }
    catch (error) {
        return next(error);
    }
});
const restoreReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restored = yield review_1.default.restoreReview(req.params.review_id);
        return restored ? res.status(200).json({ message: 'Review restored' }) : res.status(404).json({ message: 'Review not found' });
    }
    catch (error) {
        return next(error);
    }
});
const hardDeleteReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield review_1.default.hardDeleteReview(req.params.review_id);
        return deleted ? res.status(200).json({ message: 'Review deleted' }) : res.status(404).json({ message: 'Review not found' });
    }
    catch (error) {
        return next(error);
    }
});
// Obtain reviews by restaurant
const readByRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield review_1.default.getReviewsByRestaurant(req.params.restaurant_id, skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return next(error);
    }
});
const readDeletedByRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield review_1.default.getDeletedReviewsByRestaurant(req.params.restaurant_id, skip, limit);
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return next(error);
    }
});
// Obtain reviews by customer
const readByCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield review_1.default.getReviewsByCustomer(customer_id, skip, limit, {
            minGlobalRating: req.query.minGlobalRating !== undefined ? Number(req.query.minGlobalRating) : undefined,
            sortByLikes: req.query.sortByLikes === 'true'
        });
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return next(error);
    }
});
const readDeletedByCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_id } = req.params;
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { reviews, total } = yield review_1.default.getDeletedReviewsByCustomer(customer_id, skip, limit, {
            minGlobalRating: req.query.minGlobalRating !== undefined ? Number(req.query.minGlobalRating) : undefined,
            sortByLikes: req.query.sortByLikes === 'true'
        });
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return next(error);
    }
});
const likeReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_1.default.likeReview(req.params.review_id);
        return res.status(200).json(review);
    }
    catch (error) {
        return next(error);
    }
});
exports.default = {
    createReview,
    readReview,
    readDeletedReview,
    readAll,
    readAllDeleted,
    updateReview,
    softDeleteReview,
    restoreReview,
    hardDeleteReview,
    readByRestaurant,
    readDeletedByRestaurant,
    readByCustomer,
    readDeletedByCustomer,
    likeReview
};
//# sourceMappingURL=review.js.map