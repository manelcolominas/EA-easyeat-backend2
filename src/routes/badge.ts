import express from 'express';
import controller from '../controllers/badge';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

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
router.post('/', authenticate, requireRole('admin'), ValidateJoi(Schemas.badge.create), controller.createBadge);

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
router.get('/', controller.readAll);

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
router.get('/deleted', authenticate, requireRole('admin'), controller.readAllDeleted);

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
router.get('/:badge_id', controller.readBadge);

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
router.get('/:badge_id/deleted', authenticate, requireRole('admin'), controller.readDeletedBadge);

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
router.put('/:badge_id', authenticate, requireRole('admin'), ValidateJoi(Schemas.badge.update), controller.updateBadge);

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
router.delete('/:badge_id/soft', authenticate, requireRole('admin'), controller.softDeleteBadge);

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
router.patch('/:badge_id/restore', authenticate, requireRole('admin'), controller.restoreBadge);

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
router.delete('/:badge_id/hard', authenticate, requireRole('admin'), controller.hardDeleteBadge);

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
 *     responses:
 *       200:
 *         description: OK - Array of badges
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid customer_id format
 */
router.get('/customer/:customer_id', controller.getBadgesByCustomer);

export default router;
