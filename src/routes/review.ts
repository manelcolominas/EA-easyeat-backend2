import express from 'express';
import controller from '../controllers/review';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { requireAdmin, requireAuth } from '../middleware/auth';
const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: CRUD endpoints for reviews
 *
 * components:
 *   schemas:
 *     ratings:
 *       type: object
 *       properties:
 *         foodQuality:
 *           type: number
 *           example: 8
 *         staffService:
 *           type: number
 *           example: 9
 *         cleanliness:
 *           type: number
 *           example: 7
 *         environment:
 *           type: number
 *           example: 8
 *
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         customer_id:
 *           type: string
 *           description: Customer ObjectId
 *         restaurant_id:
 *           type: string
 *           description: Restaurant ObjectId
 *         date:
 *           type: string
 *           format: date
 *         globalRating:
 *           type: number
 *           example: 9
 *         ratings:
 *           $ref: '#/components/schemas/ratings'
 *         comment:
 *           type: string
 *           example: "Amazing food!"
 *         likes:
 *           type: number
 *           example: 10
 *
 *     ReviewCreateUpdate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *         - globalRating
 *       properties:
 *         customer_id:
 *           type: string
 *         restaurant_id:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         globalRating:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         ratings:
 *           $ref: '#/components/schemas/ratings'
 *         comment:
 *           type: string
 *         likes:
 *           type: number
 *           example: 10
 */

/**
 * @openapi
 * /me/reviews:
 *   post:
 *     summary: Creates a review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation error
 */
router.post('/me/reviews', requireAuth, ValidateJoi(Schemas.review.create), controller.createReview);

/**
 * @openapi
 * /reviews:
 *   get:
 *     summary: Lists all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /reviews/restaurant/{restaurantId}:
 *   get:
 *     summary: Get reviews by restaurant
 *     tags: [Reviews]
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
router.get('/restaurant/:restaurantId', controller.readByRestaurant);

/**
 * @openapi
 * /admin/reviews/customer/{customerId}:
 *   get:
 *     summary: Get reviews by customer
 *     tags: [Reviews]
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
router.get('/reviews/customer/:customerId', requireAdmin, controller.readByCustomer);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
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
router.get('/:reviewId', controller.readReview);

/**
 * @openapi
 * /me/reviews/{reviewId}:
 *   put:
 *     summary: Update review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/reviews/me/reviews/:reviewId', requireAuth, ValidateJoi(Schemas.review.update), controller.updateReview);

/**
 * @openapi
 * /me/reviews/{reviewId}:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
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
router.delete('/reviews/:reviewId', requireAuth, controller.deleteReview);

/**
 * @openapi
 * /reviews/{reviewId}/like:
 *   post:
 *     summary: Add like to review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like added
 *       404:
 *         description: Not found
 */
router.post('/:reviewId/like', controller.likeReview);

export default router;