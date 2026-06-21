'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const review_1 = __importDefault(require('../controllers/review'));
const joi_1 = require('../middleware/joi');
const router = express_1.default.Router();
/**
 * @openapi
 * tags:
 *   - name: Admin Reviews
 *     description: Backoffice CRUD endpoints for reviews
 */
/**
 * @openapi
 * /admin/reviews:
 *   get:
 *     summary: Lists all reviews
 *     tags: [Admin Reviews]
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/', review_1.default.readAll);
/**
 * @openapi
 * /admin/reviews/restaurant/{restaurantId}:
 *   get:
 *     summary: Gets reviews by restaurant
 *     tags: [Admin Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/restaurant/:restaurantId', review_1.default.readByRestaurant);
/**
 * @openapi
 * /admin/reviews/customer/{customerId}:
 *   get:
 *     summary: Gets reviews by customer
 *     tags: [Admin Reviews]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minglobalRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortByLikes
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/customer/:customerId', review_1.default.readByCustomer);
/**
 * @openapi
 * /admin/reviews/{reviewId}:
 *   get:
 *     summary: Gets a review by ID
 *     tags: [Admin Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Not found
 */
router.get('/:reviewId', review_1.default.readReview);
/**
 * @openapi
 * /admin/reviews/{reviewId}:
 *   put:
 *     summary: Updates a review
 *     tags: [Admin Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreateUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed
 */
router.put('/:reviewId', (0, joi_1.ValidateJoi)(joi_1.Schemas.review.update), review_1.default.updateReview);
/**
 * @openapi
 * /admin/reviews/{reviewId}:
 *   delete:
 *     summary: Deletes a review
 *     tags: [Admin Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:reviewId', review_1.default.deleteReview);
exports.default = router;
