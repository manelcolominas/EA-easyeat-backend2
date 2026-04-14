import express from 'express';
import controller from '../controllers/reward';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRestaurantAccess, requireRole, requireSelfOrAdmin } from '../middleware/auth';
import rewardController from '../controllers/reward';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Rewards
 *     description: CRUD endpoints for rewards
 *
 * components:
 *   schemas:
 *     Reward:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789020"
 *         restaurant_id:
 *           type: string
 *           description: Restaurant ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789013"
 *         name:
 *           type: string
 *           example: "Free Dessert"
 *         description:
 *           type: string
 *           example: "Get a free dessert after collecting enough points"
 *         pointsRequired:
 *           type: number
 *           example: 150
 *         active:
 *           type: boolean
 *           example: true
 *         expiry:
 *           type: string
 *           format: date-time
 *           example: "2026-12-31T23:59:59.000Z"
 *         timesRedeemed:
 *           type: number
 *           example: 12
 *
 *     RewardCreateUpdate:
 *       type: object
 *       required:
 *         - restaurant_id
 *         - name
 *         - description
 *         - active
 *       properties:
 *         restaurant_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789013"
 *         name:
 *           type: string
 *           example: "Free Dessert"
 *         description:
 *           type: string
 *           example: "Get a free dessert after collecting enough points"
 *         pointsRequired:
 *           type: number
 *           example: 150
 *         active:
 *           type: boolean
 *           example: true
 *         expiry:
 *           type: string
 *           format: date-time
 *           example: "2026-12-31T23:59:59.000Z"
 *         timesRedeemed:
 *           type: number
 *           example: 0
 */

/**
 * @openapi
 * /rewards:
 *   post:
 *     summary: Creates a reward
 *     tags: [Rewards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/',authenticate, requireRole('admin', 'owner'), requireRestaurantAccess('restaurant_id'),
    ValidateJoi(Schemas.reward.create),
    rewardController.createReward
);

/**
 * @openapi
 * /rewards/{reward_id}:
 *   get:
 *     summary: Gets a reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: reward_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reward's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:reward_id', controller.readReward);

/**
 * @openapi
 * /rewards:
 *   get:
 *     summary: Lists all rewards
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /rewards/{reward_id}:
 *   put:
 *     summary: Updates a reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: reward_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reward's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardCreateUpdate'
 *     responses:
 *       201:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:reward_id', authenticate, requireRole('admin', 'owner'), requireRestaurantAccess('restaurant_id'), ValidateJoi(Schemas.reward.update), controller.updateReward);

/**
 * @openapi
 * /rewards/{reward_id}:
 *   delete:
 *     summary: Deletes a reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: reward_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reward's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:reward_id',authenticate, requireRole('admin', 'owner'), requireSelfOrAdmin('restaurant_id'), controller.deleteReward);

export default router;