import express from 'express';
import controller from '../controllers/statistics';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRole, requireSelfOrAdmin, requireRestaurantAccess } from '../middleware/auth';


const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Statistics
 *     description: CRUD endpoints for restaurant statistics and analytics
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
 *
 *     RestaurantKpis:
 *       type: object
 *       properties:
 *         totalPointsGiven:
 *           type: number
 *           example: 11400
 *         loyalCustomers:
 *           type: number
 *           example: 64
 *         averagePointsPerVisit:
 *           type: number
 *           example: 98
 *
 *     VisitPerHour:
 *       type: object
 *       properties:
 *         hour:
 *           type: number
 *           example: 14
 *         total:
 *           type: number
 *           example: 12
 *
 *     RatingCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Food Quality"
 *         value:
 *           type: number
 *           example: 8.4
 *
 *     RatingsByRestaurant:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RatingCategory'
 */

/**
 * @openapi
 * /statistics/kpis/{restaurantId}:
 *   get:
 *     summary: Gets KPI cards for a restaurant
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ObjectId
 *     responses:
 *       200:
 *         description: Restaurant KPI data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantKpis'
 *       500:
 *         description: Server error
 */
router.get('/kpis/:restaurantId', controller.getRestaurantKpis);

/**
 * @openapi
 * /statistics/visits-per-hour:
 *   get:
 *     summary: Gets visits per hour for chart display
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Array of visits grouped by hour
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VisitPerHour'
 *       500:
 *         description: Server error
 */
router.get('/visits-per-hour', controller.getVisitsPerHour);

/**
 * @openapi
 * /statistics/ratings/{restaurantId}:
 *   get:
 *     summary: Gets average ratings by category for a restaurant
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ObjectId
 *     responses:
 *       200:
 *         description: Ratings grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RatingsByRestaurant'
 *       500:
 *         description: Server error
 */
router.get('/ratings/:restaurantId', controller.getAverageRatingsByRestaurant);

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
router.post('/', authenticate, requireRole('admin'), ValidateJoi(Schemas.statistics.create), controller.createStatistics);

/**
 * @openapi
 * /statistics:
 *   get:
 *     summary: Lists all statistics records
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', authenticate, requireRole('admin'), controller.readAll);

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
router.get('/:statistics_id', authenticate, requireRole('admin', 'owner'), controller.readStatistics);

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
router.put('/:statistics_id', authenticate, requireRole('admin'), ValidateJoi(Schemas.statistics.update), controller.updateStatistics);

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
router.delete('/:statistics_id', authenticate, requireRole('admin'),controller.deleteStatistics);

export default router;