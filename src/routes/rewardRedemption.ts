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
 *           example: "redeemed"
 *         redeemedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-15T14:30:00.000Z"
 *         notes:
 *           type: string
 *           example: "Redeemed at counter"
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
 *     summary: Redeems a reward in the in-person restaurant flow
 *     tags: [RewardRedemptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - reward_id
 *               - employee_id
 *             properties:
 *               customer_id:
 *                 type: string
 *                 example: "65f1c2a1b2c3d4e5f6789001"
 *               reward_id:
 *                 type: string
 *                 example: "65f1c2a1b2c3d4e5f6789002"
 *               employee_id:
 *                 type: string
 *                 example: "65f1c2a1b2c3d4e5f6789010"
 *               notes:
 *                 type: string
 *                 example: "Redeemed at counter"
 *     responses:
 *       201:
 *         description: Reward redeemed successfully
 *       400:
 *         description: Invalid request or not enough points
 *       404:
 *         description: Customer, reward or wallet not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.post(
  '/',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  ValidateJoi(Schemas.rewardRedemption.redeem),
  controller.redeemReward
);

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
router.get(
  '/:redemptionId',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.readRewardRedemption
);

/**
 * @openapi
 * /rewardRedemptions:
 *   get:
 *     summary: Lists reward redemptions with optional filters
 *     tags: [RewardRedemptions]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, approved, redeemed, cancelled, expired]
 *         description: Filter redemptions by status
 *         example: pending
 *       - in: query
 *         name: restaurant_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter redemptions by restaurant ObjectId
 *         example: "65f1c2a1b2c3d4e5f6789000"
 *       - in: query
 *         name: customer_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter redemptions by customer ObjectId
 *         example: "65f1c2a1b2c3d4e5f6789001"
 *       - in: query
 *         name: reward_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter redemptions by reward ObjectId
 *         example: "65f1c2a1b2c3d4e5f6789002"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RewardRedemption'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Validation failed (Joi)
 */
router.get(
  '/',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  ValidateJoi(Schemas.rewardRedemption.listQuery, 'query'),
  controller.readAll
);

/**
 * @openapi
 * /rewardRedemptions/{redemptionId}/status:
 *   patch:
 *     summary: Updates only the status of a reward redemption
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, redeemed, cancelled, expired]
 *                 example: "cancelled"
 *               employee_id:
 *                 type: string
 *                 nullable: true
 *                 example: "65f1c2a1b2c3d4e5f6789010"
 *               notes:
 *                 type: string
 *                 example: "Cancelled by employee"
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.patch(
  '/:redemptionId/status',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  ValidateJoi(Schemas.rewardRedemption.updateStatus),
  controller.updateStatus
);

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
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 */
router.put(
  '/:redemptionId',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  requireRestaurantAccess('restaurant_id'),
  ValidateJoi(Schemas.rewardRedemption.update),
  controller.updateRewardRedemption
);

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
router.delete(
  '/:redemptionId',
  authenticate,
  requireRole('admin'),
  controller.deleteRewardRedemption
);

export default router;