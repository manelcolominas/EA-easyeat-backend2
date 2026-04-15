import express from 'express';
import controller from '../controllers/dishRating';
import { Schemas, ValidateJoi } from '../middleware/joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: DishRatings
 *     description: Create dish ratings submitted by customers
 */

/**
 * @openapi
 * /dish-ratings:
 *   post:
 *     summary: Creates a dish rating
 *     tags: [DishRatings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - restaurant_id
 *               - dish_id
 *               - rating
 *             properties:
 *               customer_id:
 *                 type: string
 *               restaurant_id:
 *                 type: string
 *               dish_id:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Created
 *       409:
 *         description: Duplicate rating or customer limit reached
 *       422:
 *         description: Validation error
 */
router.post('/', ValidateJoi(Schemas.dishRating.create), controller.createDishRating);

export default router;