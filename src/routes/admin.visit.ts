import express from 'express';
import controller from '../controllers/visit';
import { Schemas, ValidateJoi } from '../middleware/joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Admin Visits
 *     description: Backoffice CRUD endpoints for visits
 *
 * components:
 *   schemas:
 *     Visit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         customer_id:
 *           type: string
 *         restaurant_id:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         pointsEarned:
 *           type: number
 *         billAmount:
 *           type: number
 *
 *     VisitCreate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *       properties:
 *         customer_id:
 *           type: string
 *         restaurant_id:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         pointsEarned:
 *           type: number
 *         billAmount:
 *           type: number
 *
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
 * /admin/visits:
 *   post:
 *     summary: Creates a visit
 *     tags: [Admin Visits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisitCreate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed
 */
router.post('/', ValidateJoi(Schemas.visit.create), controller.createVisit);

/**
 * @openapi
 * /admin/visits:
 *   get:
 *     summary: Lists all visits
 *     tags: [Admin Visits]
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /admin/visits/{visitId}:
 *   get:
 *     summary: Gets a visit by ID
 *     tags: [Admin Visits]
 *     parameters:
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Visit not found
 */
router.get('/:visitId', controller.readVisit);

/**
 * @openapi
 * /admin/visits/{visitId}/full:
 *   get:
 *     summary: Gets a visit with populated relations
 *     tags: [Admin Visits]
 *     parameters:
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Visit not found
 */
router.get('/:visitId/full', controller.getVisitFull);

/**
 * @openapi
 * /admin/visits/{visitId}:
 *   put:
 *     summary: Updates a visit by ID
 *     tags: [Admin Visits]
 *     parameters:
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisitUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Visit not found
 *       422:
 *         description: Validation failed
 */
router.put('/:visitId', ValidateJoi(Schemas.visit.update), controller.updateVisit);

/**
 * @openapi
 * /admin/visits/{visitId}:
 *   delete:
 *     summary: Deletes a visit by ID
 *     tags: [Admin Visits]
 *     parameters:
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Visit not found
 */
router.delete('/:visitId', controller.deleteVisit);

export default router;