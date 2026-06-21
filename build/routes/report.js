'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const report_1 = __importDefault(require('../controllers/report'));
const joi_1 = require('../middleware/joi');
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();
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
  auth_1.authenticate,
  (0, auth_1.requireRole)('customer', 'admin'),
  (0, joi_1.ValidateJoi)(joi_1.Schemas.report.createParams, 'params'),
  (0, joi_1.ValidateJoi)(joi_1.Schemas.report.create),
  report_1.default.createReport
);
/**
 * @openapi
 * /reports:
 *   get:
 *     summary: Lists all reports
 *     tags: [Reports]
 */
router.get('/reports', auth_1.authenticate, (0, auth_1.requireRole)('admin'), report_1.default.readAllReports);
/**
 * @openapi
 * /reports/{reportId}:
 *   put:
 *     summary: Updates a report by ID
 *     tags: [Reports]
 */
router.put(
  '/reports/:reportId',
  auth_1.authenticate,
  (0, auth_1.requireRole)('admin'),
  (0, joi_1.ValidateJoi)(joi_1.Schemas.updateParams, 'params'),
  (0, joi_1.ValidateJoi)(joi_1.Schemas.update),
  report_1.default.updateReport
);
/**
 * @openapi
 * /reports/{reportId}:
 *   delete:
 *     summary: Deletes a report by ID
 *     tags: [Reports]
 */
router.delete('/reports/:reportId', auth_1.authenticate, (0, auth_1.requireRole)('admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.updateParams, 'params'), report_1.default.deleteReport);
exports.default = router;
//# sourceMappingURL=report.js.map
