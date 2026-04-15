import express from 'express';
import controller from '../controllers/statistics';

const router = express.Router();

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
router.get('/restaurants/:restaurantId/top-dish', controller.getRestaurantTopDish);

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
router.get('/restaurants/:restaurantId/dish-ratings', controller.getRestaurantDishRatings);

export default router;