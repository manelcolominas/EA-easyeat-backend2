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
 *         globalRating:
 *           type: number
 *           example: 9
 *         dishRatings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               dish_id:
 *                 type: string
 *               rating:
 *                 type: number
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
 *       description: At least one of globalRating or dishRatings is required.
 *       properties:
 *         customer_id:
 *           type: string
 *         restaurant_id:
 *           type: string
 *         globalRating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         dishRatings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               dish_id:
 *                 type: string
 *               rating:
 *                 type: number
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

// ========================
// GET ALL (ADMIN)
// ========================
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  controller.readAll
);

// ========================
// GET BY RESTAURANT
// ========================
router.get('/restaurant/:restaurant_id', controller.readByRestaurant);

// ========================
// GET BY CUSTOMER
// ========================
router.get(
  '/customer/:customer_id',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.readByCustomer
);

// ========================
// GET ONE
// ========================
router.get('/:review_id', controller.readReview);

// ========================
// UPDATE
// ========================
router.put(
  '/:review_id',
  authenticate,
  requireRole('customer', 'admin'),
  ValidateJoi(Schemas.review.update),
  controller.updateReview
);

// ========================
// DELETE (SOFT)
// ========================
router.delete(
  '/:review_id',
  authenticate,
  requireRole('customer', 'admin'),
  controller.deleteReview
);

// ========================
// LIKE
// ========================
router.post(
  '/:review_id/like',
  authenticate,
  requireRole('customer', 'admin'),
  controller.likeReview
);

// ========================
// TOP DISH 
// ========================
router.get(
  '/restaurant/:restaurant_id/top-dish',
  controller.getRestaurantTopDish
);

// ========================
// ALL DISH RATINGS 
// ========================
router.get(
  '/restaurant/:restaurant_id/dishes',
  controller.getRestaurantDishesWithRatings
);

export default router;
