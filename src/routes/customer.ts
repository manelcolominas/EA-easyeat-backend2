import express from 'express';
import controller from '../controllers/customer';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth';

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

// ─── POST /customers ──────────────────────────────────────────────────────────
/**
 * @openapi
 * /customers:
 *   post:
 *     summary: Creates a new customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomer'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', ValidateJoi(Schemas.customer.create), controller.createCustomer);

// ─── GET /customers ───────────────────────────────────────────────────────────
/**
 * @openapi
 * /customers:
 *   get:
 *     summary: Lists all active customers (paginated)
 *     tags: [Customer]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCustomers'
 */
router.get('/', authenticate, requireRole('admin'), controller.readAll);

// ─── GET /customers/:customerId ───────────────────────────────────────────────
/**
 * @openapi
 * /customers/{customerId}:
 *   get:
 *     summary: Gets an active customer by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found or soft-deleted
 */
router.get('/:customerId', authenticate, requireSelfOrAdmin('customerId'), controller.readCustomer);

/**
 * @openapi
 * /customers/{customerId}/full:
 *   get:
 *     summary: Gets a customer with all populated relations
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer with all relations populated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
router.get('/:customerId/full',  authenticate, requireSelfOrAdmin('customerId'), controller.readCustomerFull);

// ─── GET /customers/:customerId/badges ─────────────────────────────────────────
/**
 * @openapi
 * /customers/{customerId}/badges:
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
router.get('/:customerId/badges', authenticate, requireSelfOrAdmin('customerId'), controller.getCustomerAllBadges);

// ─── GET /customers/:customerId/favouriteRestaurants ────────────────────────────
/**
 * @openapi
 * /customers/{customerId}/favouriteRestaurants:
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
router.get('/:customerId/favouriteRestaurants', authenticate, requireSelfOrAdmin('customerId'), controller.getCustomerAllFavouriteRestaurants);

// ─── GET /customers/:customerId/pointsWallet ───────────────────────────────────
/**
 * @openapi
 * /customers/{customerId}/pointsWallet:
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
router.get('/:customerId/pointsWallet', authenticate, requireSelfOrAdmin('customerId'), controller.getCustomerAllPointsWallet);

// ─── GET /customers/:customerId/reviews ────────────────────────────────────────
/**
 * @openapi
 * /customers/{customerId}/reviews:
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
router.get('/:customerId/reviews', authenticate, requireSelfOrAdmin('customerId'), controller.getCustomerAllReviews);

// ─── GET /customers/:customerId/visits ─────────────────────────────────────────
/**
 * @openapi
 * /customers/{customerId}/visits:
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
router.get('/:customerId/visits', authenticate, requireSelfOrAdmin('customerId'), controller.getCustomerAllVisits);

// ─── PUT /customers/:customerId ───────────────────────────────────────────────
/**
 * @openapi
 * /customers/{customerId}:
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
router.put('/:customerId', authenticate, requireSelfOrAdmin('customerId'), ValidateJoi(Schemas.customer.update), controller.updateCustomer);

// ─── DELETE /customers/:customerId  (soft delete) ─────────────────────────────
/**
 * @openapi
 * /customers/{customerId}/soft:
 *   delete:
 *     summary: Soft-deletes a customer (sets isActive=false, stamps deletedAt)
 *     tags: [Customer]
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
router.delete('/:customerId/soft', authenticate, requireSelfOrAdmin('customerId'), controller.softDeleteCustomer);

// ─── PATCH /customers/:customerId/restore ─────────────────────────────────────
/**
 * @openapi
 * /customers/{customerId}/restore:
 *   patch:
 *     summary: Restores a soft-deleted customer
 *     tags: [Customer]
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
router.patch('/:customerId/restore', authenticate, requireSelfOrAdmin('customerId'), controller.restoreCustomer);

// ─── DELETE /customers/:customerId/hard  (hard delete — admin only) ───────────
/**
 * @openapi
 * /customers/{customerId}/hard:
 *   delete:
 *     summary: Permanently deletes a customer (admin only)
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer permanently deleted
 *       404:
 *         description: Not found
 */
router.delete('/:customerId/hard', authenticate, requireSelfOrAdmin('customerId'), controller.hardDeleteCustomer);

export default router;