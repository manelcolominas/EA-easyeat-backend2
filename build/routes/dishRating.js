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
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();
/**
 * @openapi
 * tags:
 *   - name: DishRatings
 *     description: Customer ratings for individual dishes
 *
 * components:
 *   schemas:
 *     DishRating:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789abc"
 *         customer_id:
 *           type: string
 *           description: ObjectId of the customer
 *         dish_id:
 *           type: string
 *           description: ObjectId of the dish
 *         restaurant_id:
 *           type: string
 *           description: ObjectId of the restaurant (denormalized from dish)
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *           example: 8
 *         comment:
 *           type: string
 *           example: "Delicious and well-seasoned"
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     DishRatingCreate:
 *       type: object
 *       required:
 *         - customer_id
 *         - dish_id
 *         - rating
 *       properties:
 *         customer_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789011"
 *         dish_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *           example: 8
 *
 *     DishRatingSummary:
 *       type: object
 *       properties:
 *         avgRating:
 *           type: number
 *           example: 7.8
 *
 *     PaginatedDishRatings:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DishRating'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 */
// --- POST /dish-ratings ------------------------------------------------------
/**
 * @openapi
 * /dish-ratings:
 *   post:
 *     summary: Submit or update a dish rating
 *     description: >
 *       Creates a new rating or updates an existing active rating for the same
 *       customer + dish pair. The customer_id must match the authenticated
 *       user's ID (admins may use any customer_id).
 *     tags: [DishRatings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DishRatingCreate'
 *     responses:
 *       201:
 *         description: Rating created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishRating'
 *       200:
 *         description: Existing rating updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishRating'
 *       403:
 *         description: Access denied - customer_id does not match authenticated user
 *       404:
 *         description: Dish not found or not active
 *       422:
 *         description: Validation error
 */
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('customer', 'admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.dishRating.create), dishRating_1.default.rateOrUpdateDish);
// --- GET /dish-ratings/dish/:dish_id ----------------------------------------
/**
 * @openapi
 * /dish-ratings/dish/{dish_id}:
 *   get:
 *     summary: List all ratings for a dish (paginated)
 *     tags: [DishRatings]
 *     parameters:
 *       - in: path
 *         name: dish_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of ratings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedDishRatings'
 */
router.get('/dish/:dish_id', dishRating_1.default.readByDish);
// --- GET /dish-ratings/dish/:dish_id/summary --------------------------------
/**
 * @openapi
 * /dish-ratings/dish/{dish_id}/summary:
 *   get:
 *     summary: Get average rating for a dish
 *     tags: [DishRatings]
 *     parameters:
 *       - in: path
 *         name: dish_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Average rating summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishRatingSummary'
 */
router.get('/dish/:dish_id/summary', dishRating_1.default.getRatingSummary);
// --- GET /dish-ratings/customer/:customer_id --------------------------------
/**
 * @openapi
 * /dish-ratings/customer/{customer_id}:
 *   get:
 *     summary: List all ratings for a customer (self or admin, paginated)
 *     tags: [DishRatings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of ratings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedDishRatings'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */
router.get('/customer/:customer_id', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('customer_id'), dishRating_1.default.readByCustomer);
// --- DELETE /dish-ratings/:id/soft ------------------------------------------
/**
 * @openapi
 * /dish-ratings/{id}/soft:
 *   delete:
 *     summary: Soft-delete a dish rating
 *     description: >
 *       Marks the rating as deleted. Customers may only delete their own ratings;
 *       admins may delete any rating.
 *     tags: [DishRatings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rating deleted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Rating not found or already deleted
 */
router.delete('/:id/soft', auth_1.authenticate, (0, auth_1.requireRole)('customer', 'admin'), dishRating_1.default.softDeleteRating);
// --- GET /dish-ratings/top-dish/:restaurant_id ------------------------------
/**
 * @openapi
 * /dish-ratings/top-dish/{restaurant_id}:
 *   get:
 *     summary: Get top-rated dish for a restaurant
 *     description: Returns the dish with highest average rating in the restaurant.
 *     tags: [DishRatings]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Top dish by average rating
 *       404:
 *         description: No ratings found for this restaurant
 */
router.get('/top-dish/:restaurant_id', dishRating_1.default.getTopDishByRestaurant);
// --- GET /dish-ratings/top-dishes/:restaurant_id -----------------------------
/**
 * @openapi
 * /dish-ratings/top-dishes/{restaurant_id}:
 *   get:
 *     summary: Get ranked dishes for a restaurant by average rating
 *     description: Returns all active dishes rated in the restaurant, sorted by avgRating DESC.
 *     tags: [DishRatings]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ranked dish list
 *       500:
 *         description: Server error
 */
router.get('/top-dishes/:restaurant_id', dishRating_1.default.getTopDishesByRestaurant);
exports.default = router;
//# sourceMappingURL=dishRating.js.map
