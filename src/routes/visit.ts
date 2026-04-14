import express from 'express';
import controller from '../controllers/visit';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin, requireRestaurantAccess } from '../middleware/auth';


const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Visits
 *     description: CRUD endpoints for visits
 *
 * components:
 *   schemas:
 *     Visit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         customer_id:
 *           type: string
 *           description: Customer ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789013"
 *         restaurant_id:
 *           type: string
 *           description: Restaurant ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789014"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-14T10:00:00.000Z"
 *         pointsEarned:
 *           type: number
 *           example: 10
 *         billAmount:
 *           type: number
 *           example: 31.00
 *     VisitCreate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *       properties:
 *         customer_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789013"
 *         restaurant_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789014"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-14T10:00:00.000Z"
 *         pointsEarned:
 *           type: number
 *           example: 10
 *         billAmount:
 *           type: number
 *           example: 31.00
 *     VisitUpdate:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *         pointsEarned:
 *           type: number
 *         billAmount:
 *           type: number
 */

/**
 * @openapi
 * /visits:
 *   post:
 *     summary: Creates a visit
 *     tags: [Visits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisitCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/', authenticate, requireRole('admin', 'owner', 'staff'), requireRestaurantAccess('restaurant_id'), ValidateJoi(Schemas.visit.create), controller.createVisit);

/**
 * @openapi
 * /visits:
 *   get:
 *     summary: Lists all visits
 *     tags: [Visits]
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer ObjectId
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: string
 *         description: Filter by restaurant ObjectId
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 */
router.get('/', authenticate, requireRole('admin'), controller.readAll);

/**
 * @openapi
 * /visits/{visit_id}:
 *   get:
 *     summary: Gets a visit by ID
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: visit_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The visit's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Visit not found
 */
router.get('/:visit_id', authenticate, requireRole('admin', 'owner', 'staff', 'customer'), controller.readVisit);

/**
 * @openapi
 * /visits/{visit_id}/full:
 *   get:
 *     summary: Gets a visit with all populated fields (customer, restaurant)
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: visit_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The visit's ObjectId
 *     responses:
 *       200:
 *         description: Visit with populated relations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Visit not found
 */
router.get('/:visit_id/full', authenticate, requireRole('admin', 'owner', 'staff', 'customer'), controller.getVisitFull);

/**
 * @openapi
 * /visits/{visit_id}:
 *   put:
 *     summary: Updates a visit by ID
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: visit_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The visit's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisitUpdate'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Visit not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:visit_id', authenticate, requireRole('admin', 'owner', 'staff'), ValidateJoi(Schemas.visit.update), controller.updateVisit);

/**
 * @openapi
 * /visits/{visit_id}:
 *   delete:
 *     summary: Deletes a visit by ID
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: visit_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The visit's ObjectId
 *     responses:
 *       200:
 *         description: Successfully deleted
 *       404:
 *         description: Visit not found
 */
router.delete('/:visit_id', authenticate, requireRole('admin'), controller.deleteVisit);

export default router;