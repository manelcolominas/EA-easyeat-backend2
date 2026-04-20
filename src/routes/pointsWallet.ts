import express from 'express';
import controller from '../controllers/pointsWallet';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireRestaurantAccess } from '../middleware/auth';


const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: PointsWallets
 *     description: CRUD endpoints for points wallets
 *
 * components:
 *   schemas:
 *     PointsWallet:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789020"
 *         customer_id:
 *           type: string
 *           description: Reference to the Customer
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         restaurant_id:
 *           type: string
 *           description: Reference to the Restaurant
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         points:
 *           type: number
 *           description: Current points balance (cannot be negative)
 *           example: 150
 *
 *     PointsWalletCreateUpdate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *       properties:
 *         customer_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         restaurant_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         points:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           example: 150
 * 
 *     PaginatedPointsWallets:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PointsWallet'
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

/**
 * @openapi
 * /pointsWallets:
 *   post:
 *     summary: Creates a points wallet
 *     tags: [PointsWallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointsWalletCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/', authenticate, requireRole('admin', 'owner', 'staff'), requireRestaurantAccess('restaurant_id'),ValidateJoi(Schemas.pointsWallet.create), controller.createPointsWallet);

/**
 * @openapi
 * /pointsWallets:
 *   get:
 *     summary: Lists all points wallets (paginated)
 *     tags: [PointsWallets]
 *     parameters:
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
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPointsWallets'
 */
router.get('/', authenticate, requireRole('admin'),controller.readAll);

/**
 * @openapi
 * /pointsWallets/{walletId}:
 *   get:
 *     summary: Gets a points wallet by ID
 *     tags: [PointsWallets]
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: The wallet's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:walletId', authenticate, requireRole('admin', 'owner', 'staff', 'customer'),controller.readPointsWallet);

/**
 * @openapi
 * /pointsWallets/{walletId}:
 *   put:
 *     summary: Updates a points wallet by ID
 *     tags: [PointsWallets]
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: The wallet's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointsWalletCreateUpdate'
 *     responses:
 *       201:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:walletId', authenticate, requireRole('admin', 'owner', 'staff'),
    requireRestaurantAccess('restaurant_id'), ValidateJoi(Schemas.pointsWallet.update), controller.updatePointsWallet);

/**
 * @openapi
 * /pointsWallets/{walletId}:
 *   delete:
 *     summary: Deletes a points wallet by ID
 *     tags: [PointsWallets]
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: The wallet's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:walletId', authenticate, requireRole('admin'),controller.deletePointsWallet);

export default router;
