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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedDishes = getRecommendedDishes;
const restaurant_1 = require("../models/restaurant");
const dish_1 = require("../models/dish");
const servicePeriod_1 = require("./servicePeriod"); // Corrected import path
function getRecommendedDishes(preferences) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const activePeriods = (0, servicePeriod_1.getCurrentServicePeriods)(now);
        // 1. Find restaurants that are open right now
        const restaurants = yield restaurant_1.RestaurantModel.find({});
        // Filter in memory for simplicity, though this might be optimized later
        const openRestaurants = restaurants.filter((r) => r.profile && r.profile.timetable && (0, servicePeriod_1.isRestaurantOpenNow)(r.profile.timetable, now));
        const openIds = openRestaurants.map((r) => r._id);
        // 2. Build query for dishes
        const query = {
            restaurant_id: { $in: openIds },
            active: true,
            availableAt: { $in: activePeriods }
        };
        if (preferences.dietaryFlags && preferences.dietaryFlags.length > 0) {
            query.dietaryFlags = { $in: preferences.dietaryFlags };
        }
        if (preferences.flavorProfile && preferences.flavorProfile.length > 0) {
            query.flavorProfile = { $in: preferences.flavorProfile };
        }
        // 3. Find dishes that match the customer taste AND are served right now
        const dishes = yield dish_1.DishModel.find(query).populate('restaurant_id', 'profile.name profile.location profile.globalRating');
        return dishes;
    });
}
//# sourceMappingURL=recomendation.js.map