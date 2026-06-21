'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const mongoose_1 = __importDefault(require('mongoose'));
const dish_1 = require('../models/dish');
const restaurant_1 = require('../models/restaurant');
const createDish = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const dish = new dish_1.DishModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    const savedDish = yield dish.save();
    if (data.restaurant_id) {
      yield restaurant_1.RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
        $push: { dishes: savedDish._id }
      });
    }
    return savedDish;
  });
const getDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findById(dish_id);
  });
const getDeletedDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findOne({ _id: dish_id, active: false }).lean();
  });
const getAllDishes = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find({ active: true }).lean().skip(skip).limit(limit), dish_1.DishModel.countDocuments({ active: true })]);
    return { dishes, total };
  });
const getAllDeletedDishes = (skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find({ active: false }).lean().skip(skip).limit(limit), dish_1.DishModel.countDocuments({ active: false })]);
    return { dishes, total };
  });
const getByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: true };
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find(query).skip(skip).limit(limit).lean(), dish_1.DishModel.countDocuments(query)]);
    return { dishes, total };
  });
const getDeletedByRestaurant = (restaurant_id, skip, limit) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = { restaurant_id, active: false };
    const [dishes, total] = yield Promise.all([dish_1.DishModel.find(query).skip(skip).limit(limit).lean(), dish_1.DishModel.countDocuments(query)]);
    return { dishes, total };
  });
const updateDish = (dish_id, data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const dish = yield dish_1.DishModel.findById(dish_id);
    if (dish) {
      dish.set(data);
      return yield dish.save();
    }
    return null;
  });
const softDeleteDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findByIdAndUpdate(dish_id, { active: false }, { new: true }).lean();
  });
const restoreDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield dish_1.DishModel.findByIdAndUpdate(dish_id, { active: true }, { new: true }).lean();
  });
const hardDeleteDish = (dish_id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const deletedDish = yield dish_1.DishModel.findByIdAndDelete(dish_id);
    if (deletedDish && deletedDish.restaurant_id) {
      yield restaurant_1.RestaurantModel.findByIdAndUpdate(deletedDish.restaurant_id, {
        $pull: { dishes: deletedDish._id }
      });
    }
    return deletedDish;
  });
exports.default = {
  createDish,
  getDish,
  getDeletedDish,
  getAllDishes,
  getAllDeletedDishes,
  getByRestaurant,
  getDeletedByRestaurant,
  updateDish,
  softDeleteDish,
  restoreDish,
  hardDeleteDish
};
//# sourceMappingURL=dish.js.map
