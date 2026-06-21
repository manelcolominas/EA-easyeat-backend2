'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const customerDeviceToken_1 = __importDefault(require('../controllers/customerDeviceToken'));
const joi_1 = require('../middleware/joi');
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();
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
router.post('/register', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'customer'), (0, joi_1.ValidateJoi)(joi_1.Schemas.customerDeviceToken.register), customerDeviceToken_1.default.register);
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
router.post(
  '/unregister',
  auth_1.authenticate,
  (0, auth_1.requireRole)('admin', 'customer'),
  (0, joi_1.ValidateJoi)(joi_1.Schemas.customerDeviceToken.unregister),
  customerDeviceToken_1.default.unregister
);
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
router.patch('/ping', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'customer'), (0, joi_1.ValidateJoi)(joi_1.Schemas.customerDeviceToken.unregister), customerDeviceToken_1.default.ping);
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
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), customerDeviceToken_1.default.readAll);
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
router.get('/customer/:customer_id', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'customer'), customerDeviceToken_1.default.readByCustomer);
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
router.get('/:tokenId', auth_1.authenticate, (0, auth_1.requireRole)('admin'), customerDeviceToken_1.default.readToken);
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
router.delete('/:tokenId', auth_1.authenticate, (0, auth_1.requireRole)('admin'), customerDeviceToken_1.default.hardDelete);
exports.default = router;
//# sourceMappingURL=customerDeviceToken.js.map
