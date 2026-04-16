import express from 'express';
import controller from '../controllers/rewardRedemption';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRestaurantAccess, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: RewardRedemptions
 *     description: CRUD endpoints for reward redemptions
 *
 * components:
 *   schemas:
 *     RewardRedemption:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789040"
 *         customer_id:
 *           type: string
 *           description: Reference to the Customer
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         restaurant_id:
 *           type: string
 *           description: Reference to the Restaurant
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         reward_id:
 *           type: string
 *           description: Reference to the Reward
 *           example: "65f1c2a1b2c3d4e5f6789002"
 *         employee_id:
 *           type: string
 *           description: Reference to the Employee who processed the redemption
 *           example: "65f1c2a1b2c3d4e5f6789010"
 *         pointsUsed:
 *           type: number
 *           minimum: 0
 *           example: 50
 *         status:
 *           type: string
 *           enum: [pending, approved, redeemed, cancelled, expired]
 *           example: "pending"
 *         redeemedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-15T14:30:00.000Z"
 *         notes:
 *           type: string
 *           example: "Customer requested extra napkins"
 *
 *     RewardRedemptionCreateUpdate:
 *       type: object
 *       required:
 *         - customer_id
 *         - restaurant_id
 *         - reward_id
 *         - pointsUsed
 *       properties:
 *         customer_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         restaurant_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789000"
 *         reward_id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789002"
 *         employee_id:
 *           type: string
 *           nullable: true
 *           example: "65f1c2a1b2c3d4e5f6789010"
 *         pointsUsed:
 *           type: number
 *           minimum: 0
 *           example: 50
 *         status:
 *           type: string
 *           enum: [pending, approved, redeemed, cancelled, expired]
 *           default: pending
 *           example: "pending"
 *         redeemedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-15T14:30:00.000Z"
 *         notes:
 *           type: string
 *           example: "Customer requested extra napkins"
 */

/**
 * @openapi
 * /rewardRedemptions:
 *   post:
 *     summary: Creates a reward redemption
 *     tags: [RewardRedemptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardRedemptionCreateUpdate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/', authenticate, requireRole('admin', 'owner', 'staff'),
    requireRestaurantAccess('restaurant_id'),ValidateJoi(Schemas.rewardRedemption.create), controller.createRewardRedemption);

/**
 * @openapi
 * /rewardRedemptions:
 *   get:
 *     summary: Lists all reward redemptions
 *     tags: [RewardRedemptions]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', authenticate, requireRole('admin'),controller.readAll);

/**
 * @openapi
 * /rewardRedemptions/{redemptionId}:
 *   get:
 *     summary: Gets a reward redemption by ID
 *     tags: [RewardRedemptions]
 *     parameters:
 *       - in: path
 *         name: redemptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The redemption's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:redemptionId', authenticate,
    requireRole('admin', 'owner', 'staff'), controller.readRewardRedemption);

/**
 * @openapi
 * /rewardRedemptions/{redemptionId}:
 *   put:
 *     summary: Updates a reward redemption by ID
 *     tags: [RewardRedemptions]
 *     parameters:
 *       - in: path
 *         name: redemptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The redemption's ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardRedemptionCreateUpdate'
 *     responses:
 *       201:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put('/:redemptionId', authenticate, requireRole('admin', 'owner', 'staff'), requireRestaurantAccess('restaurant_id'), ValidateJoi(Schemas.rewardRedemption.update), controller.updateRewardRedemption);

/**
 * @openapi
 * /rewardRedemptions/{redemptionId}:
 *   delete:
 *     summary: Deletes a reward redemption by ID
 *     tags: [RewardRedemptions]
 *     parameters:
 *       - in: path
 *         name: redemptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The redemption's ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:redemptionId', authenticate, requireRole('admin'), controller.deleteRewardRedemption);

export default router;
