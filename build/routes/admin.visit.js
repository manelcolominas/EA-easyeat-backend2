'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const visit_1 = __importDefault(require('../controllers/visit'));
const joi_1 = require('../middleware/joi');
const router = express_1.default.Router();
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
router.post('/', (0, joi_1.ValidateJoi)(joi_1.Schemas.visit.create), visit_1.default.createVisit);
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
router.get('/', visit_1.default.readAll);
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
router.get('/:visitId', visit_1.default.readVisit);
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
router.get('/:visitId/full', visit_1.default.getVisitFull);
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
router.put('/:visitId', (0, joi_1.ValidateJoi)(joi_1.Schemas.visit.update), visit_1.default.updateVisit);
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
router.delete('/:visitId', visit_1.default.deleteVisit);
exports.default = router;
