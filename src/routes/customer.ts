import express from 'express';
import controller from '../controllers/customer';
import { Schemas, ValidateJoi } from '../middleware/joi';
import {requireAdmin, requireAuth} from '../middleware/auth';
// import { requireAdmin } from '../middleware/auth'; // ← uncomment once you have auth middleware

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Customer
 *     description: CRUD endpoints for customers.
 *
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         name:
 *           type: string
 *           example: "Nizar"
 *         email:
 *           type: string
 *           example: "nizar@gmail.com"
 *         isActive:
 *           type: boolean
 *           example: true
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         profilePictures:
 *           type: array
 *           items:
 *             type: string
 *         pointsWallet:
 *           type: array
 *           items:
 *             type: string
 *         visitHistory:
 *           type: array
 *           items:
 *             type: string
 *         favoriteRestaurants:
 *           type: array
 *           items:
 *             type: string
 *         badges:
 *           type: array
 *           items:
 *             type: string
 *         reviews:
 *           type: array
 *           items:
 *             type: string
 *
 *     CreateCustomer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           example: "Nizar"
 *         email:
 *           type: string
 *           example: "nizar@gmail.com"
 *         password:
 *           type: string
 *           example: "password123"
 *
 *     PaginatedCustomers:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Customer'
 *         total:
 *           type: number
 *           example: 42
 *         page:
 *           type: number
 *           example: 1
 *         totalPages:
 *           type: number
 *           example: 3
 */


// ─── GET /customers/me/badges ─────────────────────────────────────────
/**
 * @openapi
 * /customers/me/badges:
 *   get:
 *     summary: Gets all badges earned by the customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of badges
 *       404:
 *         description: Customer not found
 */
router.get('/me/badges', requireAuth, controller.getCustomerAllBadges);

// ─── GET /customers/me/favouriteRestaurants ────────────────────────────
/**
 * @openapi
 * /customers/me/favouriteRestaurants:
 *   get:
 *     summary: Gets all favourite restaurants for the customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of favourite restaurants
 *       404:
 *         description: Customer not found
 */
router.get('/me/favouriteRestaurants', requireAuth, controller.getCustomerAllFavouriteRestaurants);

// ─── GET /customers/me/pointsWallet ───────────────────────────────────
/**
 * @openapi
 * /customers/me/pointsWallet:
 *   get:
 *     summary: Gets all points wallet entries for the customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of points wallet entries
 *       404:
 *         description: Customer not found
 */
router.get('/me/pointsWallet', requireAuth, controller.getCustomerAllPointsWallet);

// ─── GET /customers/me/reviews ────────────────────────────────────────
/**
 * @openapi
 * /customers/me/reviews:
 *   get:
 *     summary: Gets all reviews written by the customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: Customer not found
 */
router.get('/me/reviews', requireAuth, controller.getCustomerAllReviews);

// ─── GET /customers/me/visits ─────────────────────────────────────────
/**
 * @openapi
 * /customers/me/visits:
 *   get:
 *     summary: Gets all visits for the customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of visits
 *       404:
 *         description: Customer not found
 */
router.get('/me/visits', requireAuth, controller.getCustomerAllVisits);

// ─── PUT /customers/me ───────────────────────────────────────────────
/**
 * @openapi
 * /customers/me/:
 *   put:
 *     summary: Updates an active customer by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomer'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found or already deleted
 *       422:
 *         description: Validation failed
 */
router.put('/me', requireAuth, ValidateJoi(Schemas.customer.update), controller.updateCustomer);

// ─── DELETE /customers/me  (soft delete) ─────────────────────────────
/**
 * @openapi
 * /customers/me/soft:
 *   delete:
 *     summary: Soft-deletes a customer (sets isActive=false, stamps deletedAt)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deactivated
 *       404:
 *         description: Not found
 */
router.delete('/me/soft', requireAuth, controller.softDeleteCustomer);

// ─── PATCH /customers/me/restore ─────────────────────────────────────
/**
 * @openapi
 * /customers/me/restore:
 *   patch:
 *     summary: Restores a soft-deleted customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer restored
 *       404:
 *         description: Not found
 */
router.patch('/me/restore', requireAuth, controller.restoreCustomer);

export default router;