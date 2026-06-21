'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const dishRating_1 = __importDefault(require('../controllers/dishRating'));
const joi_1 = require('../middleware/joi');
const router = express_1.default.Router();
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
router.post('/', (0, joi_1.ValidateJoi)(joi_1.Schemas.dishRating.create), dishRating_1.default.createDishRating);
exports.default = router;
