"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const visit_1 = __importDefault(require("../controllers/visit"));
const joi_1 = require("../middleware/joi");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
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
 *           example: "65f1c2a1b2c3d4e5f6789051"
 *         restaurant_id:
 *           type: string
 *           description: Restaurant ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789014"
 *         employee_id:
 *          type: string
 *          description: Employee ObjectId
 *          example: "65f1c2a1b2c3d4e5f6783001"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-14T10:00:00.000Z"
 *         billAmount:
 *           type: number
 *           example: 31.00
 *     VisitCreate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *         - date
 *         - employee_id
 *       properties:
 *         customer_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789051"
 *         restaurant_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         employee_id:
 *          type: string
 *          example: "65f1c2a1b2c3d4e5f6783001"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-14T10:00:00.000Z"
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
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), (0, joi_1.ValidateJoi)(joi_1.Schemas.visit.create), visit_1.default.createVisit);
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
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), visit_1.default.readAll);
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
router.get('/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), visit_1.default.readAllDeleted);
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
router.get('/customer/:customer_id', auth_1.authenticate, (0, auth_1.requireCustomerAccess)('customer_id'), visit_1.default.readByCustomer);
/**
 * @openapi
 * /visits/customer/{customer_id}/deleted:
 *   get:
 *     summary: Lists all deleted visits for a specific customer
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
router.get('/customer/:customer_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), visit_1.default.readDeletedByCustomer);
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
router.get('/restaurant/:restaurant_id', auth_1.authenticate, (0, auth_1.requireRestaurantAccess)('restaurant_id'), visit_1.default.readByRestaurant);
/**
 * @openapi
 * /visits/restaurant/{restaurant_id}/deleted:
 *   get:
 *     summary: Lists all deleted visits for a specific restaurant
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
router.get('/restaurant/:restaurant_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), visit_1.default.readDeletedByRestaurant);
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
router.get('/:visit_id', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff', 'customer'), visit_1.default.readVisit);
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
router.get('/:visit_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff', 'customer'), visit_1.default.readDeletedVisit);
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
router.put('/:visit_id', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), (0, joi_1.ValidateJoi)(joi_1.Schemas.visit.update), visit_1.default.updateVisit);
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
router.delete('/:visit_id/soft', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), visit_1.default.softDeleteVisit);
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
router.patch('/:visit_id/restore', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), visit_1.default.restoreVisit);
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
router.delete('/:visit_id/hard', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), visit_1.default.hardDeleteVisit);
exports.default = router;
//# sourceMappingURL=visit.js.map