"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const badge_1 = __importDefault(require("../controllers/badge"));
const joi_1 = require("../middleware/joi");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @openapi
 * tags:
 *   - name: Badges
 *     description: CRUD endpoints for badges
 *
 * components:
 *   schemas:
 *     Badge:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789030"
 *         title:
 *           type: string
 *           example: "Loyal Customer"
 *         description:
 *           type: string
 *           example: "Awarded after 10 visits"
 *         type:
 *           type: string
 *           example: "visit_milestone"
 *
 *     BadgeCreateUpdate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           example: "Loyal Customer"
 *         description:
 *           type: string
 *           example: "Awarded after 10 visits"
 *         type:
 *           type: string
 *           example: "visit_milestone"
 *
 *     PaginatedBadges:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Badge'
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
 * /badges:
 *   post:
 *     summary: Creates a badge
 *     tags: [Badges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BadgeCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.badge.create), badge_1.default.createBadge);
/**
 * @openapi
 * /badges:
 *   get:
 *     summary: Lists all badges
 *     tags: [Badges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: page number
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
 *               $ref: '#/components/schemas/PaginatedBadges'
 */
router.get('/', badge_1.default.readAll);
/**
 * @openapi
 * /badges/deleted:
 *   get:
 *     summary: Lists all deleted badges
 *     tags: [Badges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: page number
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
 *               $ref: '#/components/schemas/PaginatedBadges'
 */
router.get('/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), badge_1.default.readAllDeleted);
/**
 * @openapi
 * /badges/restaurant/{restaurant_id}:
 *   get:
 *     summary: Gets all badges for a restaurant
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
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
 *         description: OK - Array of badges
 *       404:
 *         description: Restaurant not found
 *       400:
 *         description: Invalid restaurant_id format
 */
router.get('/restaurant/:restaurant_id', badge_1.default.readByRestaurant);
/**
 * @openapi
 * /badges/restaurant/{restaurant_id}/deleted:
 *   get:
 *     summary: Gets all deleted badges for a restaurant
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
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
 *         description: OK - Array of badges
 *       404:
 *         description: Restaurant not found
 *       400:
 *         description: Invalid restaurant_id format
 */
router.get('/restaurant/:restaurant_id/deleted', badge_1.default.readDeletedByRestaurant);
/**
 * @openapi
 * /badges/customer/{customer_id}:
 *   get:
 *     summary: Gets all badges for a customer
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ObjectId
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
 *         description: OK - Array of badges
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid customer_id format
 */
router.get('/customer/:customer_id', badge_1.default.readByCustomer);
/**
 * @openapi
 * /badges/customer/{customer_id}/deleted:
 *   get:
 *     summary: Gets all deleted badges for a customer
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ObjectId
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
 *         description: OK - Array of badges
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid customer_id format
 */
router.get('/customer/:customer_id/deleted', badge_1.default.readDeletedByCustomer);
/**
 * @openapi
 * /badges/{badge_id}:
 *   get:
 *     summary: Gets a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:badge_id', badge_1.default.readBadge);
/**
 * @openapi
 * /badges/{badge_id}/deleted:
 *   get:
 *     summary: Gets a deleted badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:badge_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), badge_1.default.readDeletedBadge);
/**
 * @openapi
 * /badges/{badge_id}:
 *   put:
 *     summary: Updates a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BadgeCreateUpdate'
 *     responses:
 *       201:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:badge_id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.badge.update), badge_1.default.updateBadge);
/**
 * @openapi
 * /badges/{badge_id}/soft:
 *   delete:
 *     summary: Soft deletes a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:badge_id/soft', auth_1.authenticate, (0, auth_1.requireRole)('admin'), badge_1.default.softDeleteBadge);
/**
 * @openapi
 * /badges/{badge_id}/restore:
 *   patch:
 *     summary: Restores a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.patch('/:badge_id/restore', auth_1.authenticate, (0, auth_1.requireRole)('admin'), badge_1.default.restoreBadge);
/**
 * @openapi
 * /badges/{badge_id}/hard:
 *   delete:
 *     summary: Permanently deletes a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:badge_id/hard', auth_1.authenticate, (0, auth_1.requireRole)('admin'), badge_1.default.hardDeleteBadge);
exports.default = router;
//# sourceMappingURL=badge.js.map