"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statistics_1 = __importDefault(require("../controllers/statistics"));
const router = express_1.default.Router();
/**
 * @openapi
 * tags:
 *   - name: PublicStatistics
 *     description: Public restaurant dish statistics for frontend consumption
 */
/**
 * @openapi
 * /statistics/restaurants/{restaurantId}/top-dish:
 *   get:
 *     summary: Gets the top-rated dish for a restaurant
 *     tags: [PublicStatistics]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Top dish or empty result when no ratings exist
 *       404:
 *         description: Restaurant not found
 */
router.get('/restaurants/:restaurantId/top-dish', statistics_1.default.getRestaurantTopDish);
/**
 * @openapi
 * /statistics/restaurants/{restaurantId}/dish-ratings:
 *   get:
 *     summary: Lists all dishes in a restaurant with their average rating
 *     tags: [PublicStatistics]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dish list with averages
 *       404:
 *         description: Restaurant not found
 */
router.get('/restaurants/:restaurantId/dish-ratings', statistics_1.default.getRestaurantDishRatings);
exports.default = router;
