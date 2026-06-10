import express from 'express';
import controller from '../controllers/customerDeviceToken';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: CustomerDeviceTokens
 *     description: FCM device token registration for push notifications
 *
 * components:
 *   schemas:
 *     CustomerDeviceToken:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789030"
 *         customer_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         token:
 *           type: string
 *           example: "eXaMpLeFcMtOkEn123"
 *         platform:
 *           type: string
 *           enum: [android, ios, web]
 *           example: "android"
 *         active:
 *           type: boolean
 *           example: true
 *         lastSeenAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CustomerDeviceTokenRegister:
 *       type: object
 *       required:
 *         - customer_id
 *         - token
 *       properties:
 *         customer_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         token:
 *           type: string
 *           example: "eXaMpLeFcMtOkEn123"
 *         platform:
 *           type: string
 *           enum: [android, ios, web]
 *           default: web
 *           example: "ios"
 *
 *     CustomerDeviceTokenUnregister:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           example: "eXaMpLeFcMtOkEn123"
 *
 *     PaginatedCustomerDeviceTokens:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerDeviceToken'
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
 * /customerDeviceTokens/register:
 *   post:
 *     summary: Register (upsert) a FCM device token
 *     description: Creates the token if it does not exist, or re-activates it if it was previously unregistered.
 *     tags: [CustomerDeviceTokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerDeviceTokenRegister'
 *     responses:
 *       201:
 *         description: Token registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerDeviceToken'
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/register', authenticate, requireRole('admin', 'customer'), ValidateJoi(Schemas.customerDeviceToken.register), controller.register);

/**
 * @openapi
 * /customerDeviceTokens/unregister:
 *   post:
 *     summary: Unregister a FCM device token
 *     description: Soft-deactivates the token so the device stops receiving push notifications.
 *     tags: [CustomerDeviceTokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerDeviceTokenUnregister'
 *     responses:
 *       200:
 *         description: Token unregistered
 *       404:
 *         description: Token not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/unregister', authenticate, requireRole('admin', 'customer'), ValidateJoi(Schemas.customerDeviceToken.unregister), controller.unregister);

/**
 * @openapi
 * /customerDeviceTokens/ping:
 *   patch:
 *     summary: Refresh lastSeenAt for a token
 *     description: Call on app foreground or startup to confirm the device is still active.
 *     tags: [CustomerDeviceTokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerDeviceTokenUnregister'
 *     responses:
 *       200:
 *         description: lastSeenAt updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerDeviceToken'
 *       404:
 *         description: Token not found or inactive
 */
router.patch('/ping', authenticate, requireRole('admin', 'customer'), ValidateJoi(Schemas.customerDeviceToken.unregister), controller.ping);

/**
 * @openapi
 * /customerDeviceTokens:
 *   get:
 *     summary: List all device tokens (paginated)
 *     tags: [CustomerDeviceTokens]
 *     security:
 *       - bearerAuth: []
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
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCustomerDeviceTokens'
 */
router.get('/', authenticate, requireRole('admin'), controller.readAll);

/**
 * @openapi
 * /customerDeviceTokens/customer/{customer_id}:
 *   get:
 *     summary: List all active tokens for a customer
 *     tags: [CustomerDeviceTokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerDeviceToken'
 */
router.get('/customer/:customer_id', authenticate, requireRole('admin', 'customer'), controller.readByCustomer);

/**
 * @openapi
 * /customerDeviceTokens/{tokenId}:
 *   get:
 *     summary: Get a device token by ID
 *     tags: [CustomerDeviceTokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerDeviceToken'
 *       404:
 *         description: Not found
 */
router.get('/:tokenId', authenticate, requireRole('admin'), controller.readToken);

/**
 * @openapi
 * /customerDeviceTokens/{tokenId}:
 *   delete:
 *     summary: Permanently delete a device token (admin only)
 *     tags: [CustomerDeviceTokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:tokenId', authenticate, requireRole('admin'), controller.hardDelete);

export default router;
