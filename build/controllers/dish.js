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
const dish_1 = __importDefault(require("../services/dish"));
const pagination_1 = require("../utils/pagination");
const createDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedDish = yield dish_1.default.createDish(req.body);
        return res.status(201).json(savedDish);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const dish = yield dish_1.default.getDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readDeletedDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const dish = yield dish_1.default.getDeletedDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { dishes, total } = yield dish_1.default.getAllDishes(skip, limit);
        return res.status(200).json({
            data: dishes,
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
        const { dishes, total } = yield dish_1.default.getAllDeletedDishes(skip, limit);
        return res.status(200).json({
            data: dishes,
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
        const { dishes, total } = yield dish_1.default.getByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: dishes,
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
        const { dishes, total } = yield dish_1.default.getDeletedByRestaurant(restaurant_id, skip, limit);
        return res.status(200).json({
            data: dishes,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const updateDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const updatedDish = yield dish_1.default.updateDish(dish_id, req.body);
        return updatedDish ? res.status(201).json(updatedDish) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const softDeleteDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const dish = yield dish_1.default.softDeleteDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const restoreDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const dish = yield dish_1.default.restoreDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const hardDeleteDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_id } = req.params;
    try {
        const dish = yield dish_1.default.hardDeleteDish(dish_id);
        return dish ? res.status(200).json(dish) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.default = {
    createDish,
    readDish,
    readDeletedDish,
    readAll,
    readAllDeleted,
    readByRestaurant,
    readDeletedByRestaurant,
    updateDish,
    softDeleteDish,
    restoreDish,
    hardDeleteDish
};
//# sourceMappingURL=dish.js.map