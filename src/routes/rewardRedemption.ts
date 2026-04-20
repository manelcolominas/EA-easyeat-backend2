import express from 'express';
import controller from '../controllers/rewardRedemption';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { authenticate, requireRestaurantAccess, requireRole, requireSelfOrAdmin } from '../middleware/auth';

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
 *     summary: Lists reward redemptions with pagination
 *     tags: [RewardRedemptions]
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
  requireRole('admin'),
  controller.readAll
);

/**
 * @openapi
 * /rewardRedemptions/customer/{customer_id}:
 *   get:
 *     summary: Get reward redemptions by customer
 *     tags: [RewardRedemptions]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/customer/:customer_id',
  authenticate,
  requireSelfOrAdmin('customer_id'),
  controller.readByCustomer
);

/**
 * @openapi
 * /rewardRedemptions/restaurant/{restaurant_id}:
 *   get:
 *     summary: Get reward redemptions by restaurant
 *     tags: [RewardRedemptions]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/restaurant/:restaurant_id',
  authenticate,
  requireRestaurantAccess('restaurant_id'),
  controller.readByRestaurant
);

/**
 * @openapi
 * /rewardRedemptions/employee/{employee_id}:
 *   get:
 *     summary: Get reward redemptions by employee
 *     tags: [RewardRedemptions]
 *     parameters:
 *       - in: path
 *         name: employee_id
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
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/employee/:employee_id',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.readByEmployee
);

/**
 * @openapi
 * /rewardRedemptions/reward/{reward_id}:
 *   get:
 *     summary: Get reward redemptions by reward
 *     tags: [RewardRedemptions]
 *     parameters:
 *       - in: path
 *         name: reward_id
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
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/reward/:reward_id',
  authenticate,
  requireRole('admin', 'owner', 'staff'),
  controller.readByReward
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