import express from 'express';
import controller from '../controllers/reward';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { requireAdmin, requireAuth } from '../middleware/auth';
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
 * /admin/rewards:
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
router.post('/', requireAdmin, ValidateJoi(Schemas.reward.create), controller.createReward);

/**
 * @openapi
 * /admin/rewards/{rewardId}:
 *   get:
 *     summary: Gets a reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: rewardId
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
router.get('/:rewardId', requireAdmin, controller.readReward);

/**
 * @openapi
 * /admin/rewards:
 *   get:
 *     summary: Lists all rewards
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', requireAdmin, controller.readAll);

/**
 * @openapi
 * /admin/rewards/{rewardId}:
 *   put:
 *     summary: Updates a reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: rewardId
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
router.put('/:rewardId', requireAdmin, ValidateJoi(Schemas.reward.update), controller.updateReward);

/**
 * @openapi
 * /admin/rewards/{rewardId}:
 *   delete:
 *     summary: Deletes a reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: rewardId
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
router.delete('/:rewardId', requireAdmin, controller.deleteReward);

export default router;