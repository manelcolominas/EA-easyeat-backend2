import express from 'express';
import controller from '../controllers/review';
import { Schemas, ValidateJoi } from '../middleware/joi';

const router = express.Router();

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
router.get('/', controller.readAll);

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
router.get('/restaurant/:restaurantId', controller.readByRestaurant);

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
router.get('/customer/:customerId', controller.readByCustomer);

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
router.get('/:reviewId', controller.readReview);

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
router.put('/:reviewId', ValidateJoi(Schemas.review.update), controller.updateReview);

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
router.delete('/:reviewId', controller.deleteReview);

export default router;