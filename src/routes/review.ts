import express from 'express';
import controller from '../controllers/review';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth';

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
 * /reviews:
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
router.post('/', authenticate, requireRole('customer', 'admin'), ValidateJoi(Schemas.review.create), controller.createReview);

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
router.get('/', authenticate, requireRole('admin'), controller.readAll);

/**
 * @openapi
 * /reviews/restaurant/{restaurant_id}:
 *   get:
 *     summary: Get reviews by restaurant
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/restaurant/:restaurant_id', controller.readByRestaurant);

/**
 * @openapi
 * /reviews/customer/{customer_id}:
 *   get:
 *     summary: Get reviews by customer
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: customer_id
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
router.get('/customer/:customer_id', authenticate, requireSelfOrAdmin('customer_id'),controller.readByCustomer);

/**
 * @openapi
 * /reviews/{review_id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Not found
 */
router.get('/:review_id', controller.readReview);

/**
 * @openapi
 * /reviews/{review_id}:
 *   put:
 *     summary: Update review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:review_id', authenticate, requireRole('customer', 'admin'),ValidateJoi(Schemas.review.update), controller.updateReview);

/**
 * @openapi
 * /reviews/{review_id}:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:review_id', authenticate, requireRole('customer', 'admin'), controller.deleteReview);

/**
 * @openapi
 * /reviews/{review_id}/like:
 *   post:
 *     summary: Add like to review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like added
 *       404:
 *         description: Not found
 */
router.post('/:review_id/like', authenticate, requireRole('customer', 'admin'), controller.likeReview);

export default router;