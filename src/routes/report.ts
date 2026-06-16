import express from 'express';
import controller from '../controllers/report';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Reports
 *     description: Endpoint definitions for reporting restaurants
 *
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789090"
 *         restaurantId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         userId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789010"
 *         reason:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *           example: "El restaurante aparece como abierto pero está cerrado permanentemente"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-02T11:09:51.000Z"
 *
 *     ReportCreate:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *           example: "El restaurante aparece como abierto pero está cerrado permanentemente"
 */

/**
 * @openapi
 * /restaurants/{restaurantId}/report:
 *   post:
 *     summary: Submits a report about a restaurant
 *     tags: [Reports]
 */
router.post(
    '/restaurants/:restaurantId/report',
    authenticate,
    requireRole('customer', 'admin'),
    ValidateJoi(Schemas.report.createParams, 'params'),
    ValidateJoi(Schemas.report.create),
    controller.createReport
);

/**
 * @openapi
 * /reports:
 *   get:
 *     summary: Lists all reports
 *     tags: [Reports]
 */
router.get(
    '/reports',
    authenticate,
    requireRole('admin'),
    controller.readAllReports
);

/**
 * @openapi
 * /reports/{reportId}:
 *   put:
 *     summary: Updates a report by ID
 *     tags: [Reports]
 */
router.put(
    '/reports/:reportId',
    authenticate,
    requireRole('admin'),
    ValidateJoi(Schemas.updateParams, 'params'),
    ValidateJoi(Schemas.update),
    controller.updateReport
);

/**
 * @openapi
 * /reports/{reportId}:
 *   delete:
 *     summary: Deletes a report by ID
 *     tags: [Reports]
 */
router.delete(
    '/reports/:reportId',
    authenticate,
    requireRole('admin'),
    ValidateJoi(Schemas.updateParams, 'params'),
    controller.deleteReport
);

export default router;