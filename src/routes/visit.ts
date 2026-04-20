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
 */
router.post('/', authenticate, requireRole('admin', 'owner', 'staff'), requireRestaurantAccess('restaurant_id'), ValidateJoi(Schemas.visit.create), controller.createVisit);

/**
 * @openapi
 * /visits:
 *   get:
 *     summary: Lists all visits with pagination
 *     tags: [Visits]
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
 *           default: 5
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', authenticate, requireRole('admin'), controller.readAll);

/**
 * @openapi
 * /visits/deleted:
 *   get:
 *     summary: Lists all deleted visits with pagination
 *     tags: [Visits]
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
 *           default: 5
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/deleted', authenticate, requireRole('admin'), controller.readAllDeleted);

/**
 * @openapi
 * /visits/customer/{customer_id}:
 *   get:
 *     summary: Lists all visits for a specific customer
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/customer/:customer_id', authenticate, requireSelfOrAdmin('customer_id'), controller.readByCustomer);

/**
 * @openapi
 * /visits/restaurant/{restaurant_id}:
 *   get:
 *     summary: Lists all visits for a specific restaurant
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/restaurant/:restaurant_id', authenticate, requireRestaurantAccess('restaurant_id'), controller.readByRestaurant);

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
 *       404:
 *         description: Visit not found
 */
router.get('/:visit_id', authenticate, requireRole('admin', 'owner', 'staff', 'customer'), controller.readVisit);

/**
 * @openapi
 * /visits/{visit_id}/deleted:
 *   get:
 *     summary: Gets a deleted visit by ID
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
 *       404:
 *         description: Not found
 */
router.get('/:visit_id/deleted', authenticate, requireRole('admin'), controller.readDeletedVisit);

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
 *       404:
 *         description: Visit not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:visit_id', authenticate, requireRole('admin', 'owner', 'staff'), ValidateJoi(Schemas.visit.update), controller.updateVisit);

/**
 * @openapi
 * /visits/{visit_id}/soft:
 *   delete:
 *     summary: Soft deletes a visit by ID
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
router.delete('/:visit_id/soft', authenticate, requireRole('admin'), controller.softDeleteVisit);

/**
 * @openapi
 * /visits/{visit_id}/restore:
 *   patch:
 *     summary: Restores a deleted visit by ID
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
 *         description: Successfully restored
 *       404:
 *         description: Visit not found
 */
router.patch('/:visit_id/restore', authenticate, requireRole('admin'), controller.restoreVisit);

/**
 * @openapi
 * /visits/{visit_id}/hard:
 *   delete:
 *     summary: Hard deletes a visit by ID
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
router.delete('/:visit_id/hard', authenticate, requireRole('admin'), controller.hardDeleteVisit);

export default router;
