"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statistics_1 = __importDefault(require("../controllers/statistics"));
const joi_1 = require("../middleware/joi");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @openapi
 * tags:
 *   - name: Statistics
 *     description: CRUD endpoints for restaurant statistics
 *
 * components:
 *   schemas:
 *     Statistics:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789050"
 *         restaurant_id:
 *           type: string
 *           description: Reference to the Restaurant (unique per restaurant)
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         totalPointsGiven:
 *           type: number
 *           description: Cumulative points awarded to all customers
 *           default: 0
 *           example: 4200
 *         loyalCustomers:
 *           type: number
 *           description: Count of customers considered loyal
 *           default: 0
 *           example: 38
 *         mostRequestedRewards:
 *           type: array
 *           description: ObjectIds of the most redeemed rewards
 *           items:
 *             type: string
 *           example: ["65f1c2a1b2c3d4e5f6789002", "65f1c2a1b2c3d4e5f6789003"]
 *         averagePointsPerVisit:
 *           type: number
 *           description: Average points earned per customer visit
 *           default: 0
 *           example: 12.5
 *
 *     StatisticsCreateUpdate:
 *       type: object
 *       required:
 *         - restaurant_id
 *       properties:
 *         restaurant_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         totalPointsGiven:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           example: 4200
 *         loyalCustomers:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           example: 38
 *         mostRequestedRewards:
 *           type: array
 *           items:
 *             type: string
 *           example: ["65f1c2a1b2c3d4e5f6789002", "65f1c2a1b2c3d4e5f6789003"]
 *         averagePointsPerVisit:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           example: 12.5
 */
/**
 * @openapi
 * /statistics:
 *   post:
 *     summary: Creates a statistics record for a restaurant
 *     tags: [Statistics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatisticsCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.statistics.create), statistics_1.default.createStatistics);
/**
 * @openapi
 * /statistics:
 *   get:
 *     summary: Lists all statistics records with pagination
 *     tags: [Statistics]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner', 'staff'), statistics_1.default.readAll);
/**
 * @openapi
 * /statistics/restaurant/{restaurant_id}:
 *   get:
 *     summary: Gets statistics record by restaurant ID
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/restaurant/:restaurant_id', auth_1.authenticate, (0, auth_1.requireRole)('owner', 'staff'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), statistics_1.default.readByRestaurant);
/**
 * @openapi
 * /statistics/{statistics_id}:
 *   get:
 *     summary: Gets a statistics record by ID
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: statistics_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The statistics record's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:statistics_id', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner'), statistics_1.default.readStatistics);
/**
 * @openapi
 * /statistics/{statistics_id}:
 *   put:
 *     summary: Updates a statistics record by ID
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: statistics_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The statistics record's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatisticsCreateUpdate'
 *     responses:
 *       201:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:statistics_id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), (0, joi_1.ValidateJoi)(joi_1.Schemas.statistics.update), statistics_1.default.updateStatistics);
/**
 * @openapi
 * /statistics/{statistics_id}:
 *   delete:
 *     summary: Deletes a statistics record by ID
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: statistics_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The statistics record's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:statistics_id', auth_1.authenticate, (0, auth_1.requireRole)('admin'), statistics_1.default.deleteStatistics);
exports.default = router;
//# sourceMappingURL=statistics.js.map