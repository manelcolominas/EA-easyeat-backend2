import express from 'express';
import controller from '../controllers/badge';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin, requireRestaurantAccess } from '../middleware/auth';

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
router.post('/', ValidateJoi(Schemas.badge.create), controller.createBadge);

/**
 * @openapi
 * /badges/{badgeId}:
 *   get:
 *     summary: Gets a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badgeId
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
router.get('/:badgeId', controller.readBadge);

/**
 * @openapi
 * /badges:
 *   get:
 *     summary: Lists all badges
 *     tags: [Badges]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /badges/{badgeId}:
 *   put:
 *     summary: Updates a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badgeId
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
router.put('/:badgeId', ValidateJoi(Schemas.badge.update), controller.updateBadge);

/**
 * @openapi
 * /badges/{badgeId}:
 *   delete:
 *     summary: Deletes a badge by ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: badgeId
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
router.delete('/:badgeId', controller.deleteBadge);

export default router;
