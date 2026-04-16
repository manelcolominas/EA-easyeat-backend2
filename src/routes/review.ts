import express from 'express';
import controller from '../controllers/review';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: CRUD endpoints for reviews (restaurant + dish ratings)
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
 *         restaurant_id:
 *           type: string
 *         dish_id:
 *           type: string
 *           description: Optional dish being rated
 *         globalRating:
 *           type: number
 *           example: 9
 *         dishRating:
 *           type: number
 *           example: 8
 *         ratings:
 *           $ref: '#/components/schemas/ratings'
 *         comment:
 *           type: string
 *         likes:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 *
 *     ReviewCreateUpdate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *       description: At least one of globalRating or dishRating is required.
 *         If dish_id is sent, dishRating is also required.
 *       properties:
 *         customer_id:
 *           type: string
 *         restaurant_id:
 *           type: string
 *         dish_id:
 *           type: string
 *         globalRating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         dishRating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         ratings:
 *           $ref: '#/components/schemas/ratings'
 *         comment:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 */

// ========================
// CREATE REVIEW (RESTAURANT + DISH)
// ========================
/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Creates a review (restaurant and optional dish rating)
 *     tags: [Reviews]
 */
router.post(
  '/',
  authenticate,
  requireRole('customer', 'admin'),
  ValidateJoi(Schemas.review.create),
  controller.createReview
);

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
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  controller.readAll
);

/**
 * @openapi
 * /reviews/deleted:
 *   get:
 *     summary: Lists all deleted reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of deleted reviews
 */
router.get(
  '/deleted',
  authenticate,
  requireRole('admin'),
  controller.readAllDeleted
);


// ========================
// GET BY RESTAURANT
// ========================
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
router.get(
  '/restaurant/:restaurant_id',
  controller.readByRestaurant
);


/**
 * @openapi
 * /reviews/restaurant/{restaurant_id}/deleted:
 *   get:
 *     summary: Get deleted reviews by restaurant
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of deleted reviews
 */
router.get(
  '/restaurant/:restaurant_id/deleted',
  authenticate,
  requireRole('admin'),
  controller.readDeletedByRestaurant
);

// ========================
// GET BY CUSTOMER
// ========================

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
router.get(
  '/customer/:customer_id',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.readByCustomer
);

/**
 * @openapi
 * /reviews/customer/{customer_id}/deleted:
 *   get:
 *     summary: Get deleted reviews by customer
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
 *         description: List of deleted reviews
 */
router.get(
  '/customer/:customer_id/deleted',
  authenticate,
  requireRole('admin'),
  controller.readDeletedByCustomer
);

// ========================
// GET ONE
// ========================
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
router.get(
  '/:review_id',
  controller.readReview
);

/**
 * @openapi
 * /reviews/{review_id}/deleted:
 *   get:
 *     summary: Get deleted review by ID
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
router.get(
  '/:review_id/deleted',
  authenticate,
  requireRole('admin'),
  controller.readDeletedReview
);

// ========================
// UPDATE
// ========================

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
router.put(
  '/:review_id',
  authenticate,
  requireRole('customer', 'admin'),
  ValidateJoi(Schemas.review.update),
  controller.updateReview
);

// ========================
// DELETE
// ========================

/**
 * @openapi
 * /reviews/{review_id}/soft:
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
router.delete(
  '/:review_id/soft',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.softDeleteReview
);

/**
 * @openapi
 * /reviews/{review_id}/restore:
 *   patch:
 *     summary: Restore review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restored
 *       404:
 *         description: Not found
 */
router.patch(
  '/:review_id/restore',
  authenticate,
  requireRole('admin'),
  controller.restoreReview
);

/**
 * @openapi
 * /reviews/{review_id}/hard:
 *   delete:
 *     summary: Hard delete review
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
router.delete(
  '/:review_id/hard',
  authenticate,
  requireRole('admin'),
  controller.hardDeleteReview
);

// ========================
// TOP DISH !!!FALTA EL SWAGGER
// ========================
router.get(
  '/restaurant/:restaurant_id/top-dish',
  controller.getRestaurantTopDish
);

// ========================
// ALL DISH RATINGS  !!! FALTA EL SWAGGER
// ========================
router.get(
  '/restaurant/:restaurant_id/dishes',
  controller.getRestaurantDishesWithRatings
);

export default router;
