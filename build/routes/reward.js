"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reward_1 = __importDefault(require("../controllers/reward"));
const joi_1 = require("../middleware/joi");
const auth_1 = require("../middleware/auth");
const reward_2 = __importDefault(require("../controllers/reward"));
const router = express_1.default.Router();
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
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), (0, joi_1.ValidateJoi)(joi_1.Schemas.reward.create), reward_2.default.createReward);
/**
 * @openapi
 * /rewards:
 *   get:
 *     summary: Lists all rewards
 *     tags: [Rewards]
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
router.get('/', reward_1.default.readAll);
/**
 * @openapi
 * /rewards/deleted:
 *   get:
 *     summary: Lists all deleted rewards
 *     tags: [Rewards]
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
router.get('/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), reward_1.default.readAllDeleted);
/**
 * @openapi
 * /rewards/restaurant/{restaurant_id}:
 *   get:
 *     summary: Lists all rewards of a restaurant
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
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
router.get('/restaurant/:restaurant_id', reward_1.default.readByRestaurant);
/**
 * @openapi
 * /rewards/restaurant/{restaurant_id}/deleted:
 *   get:
 *     summary: Lists all deleted rewards of a restaurant
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant's ObjectId
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
router.get('/restaurant/:restaurant_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), reward_1.default.readDeletedByRestaurant);
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
router.get('/:reward_id', reward_1.default.readReward);
/**
 * @openapi
 * /rewards/{reward_id}/deleted:
 *   get:
 *     summary: Gets a deleted reward by ID
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
router.get('/:reward_id/deleted', auth_1.authenticate, (0, auth_1.requireRole)('admin'), reward_1.default.readDeletedReward);
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
router.put('/:reward_id', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), (0, joi_1.ValidateJoi)(joi_1.Schemas.reward.update), reward_1.default.updateReward);
/**
 * @openapi
 * /rewards/{reward_id}/soft:
 *   delete:
 *     summary: Soft deletes a reward by ID
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
router.delete('/:reward_id/soft', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner'), (0, auth_1.requireRestaurantAccess)('restaurant_id'), reward_1.default.softDeleteReward);
/**
 * @openapi
 * /rewards/{reward_id}/restore:
 *   patch:
 *     summary: Restores a deleted reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: reward_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reward's ObjectId
 *     responses:
 *       201:
 *         description: Restored
 *       404:
 *         description: Not found
 */
router.patch('/:reward_id/restore', auth_1.authenticate, (0, auth_1.requireRole)('admin'), reward_1.default.restoreReward);
/**
 * @openapi
 * /rewards/{reward_id}/hard:
 *   delete:
 *     summary: Hard deletes a reward by ID
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
router.delete('/:reward_id/hard', auth_1.authenticate, (0, auth_1.requireRole)('admin', 'owner'), reward_1.default.hardDeleteReward);
exports.default = router;
//# sourceMappingURL=reward.js.map