"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reward_1 = __importDefault(require("../controllers/reward"));
const joi_1 = require("../middleware/joi");
const router = express_1.default.Router();
/**
 * @openapi
 * tags:
 *   - name: Admin Rewards
 *     description: Backoffice CRUD endpoints for rewards
 */
/**
 * @openapi
 * /admin/rewards:
 *   post:
 *     summary: Creates a reward
 *     tags: [Admin Rewards]
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
 *         description: Validation failed
 */
router.post('/', (0, joi_1.ValidateJoi)(joi_1.Schemas.reward.create), reward_1.default.createReward);
/**
 * @openapi
 * /admin/rewards:
 *   get:
 *     summary: Lists all rewards
 *     tags: [Admin Rewards]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', reward_1.default.readAll);
/**
 * @openapi
 * /admin/rewards/{rewardId}:
 *   get:
 *     summary: Gets a reward by ID
 *     tags: [Admin Rewards]
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:rewardId', reward_1.default.readReward);
/**
 * @openapi
 * /admin/rewards/{rewardId}:
 *   put:
 *     summary: Updates a reward by ID
 *     tags: [Admin Rewards]
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardCreateUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed
 */
router.put('/:rewardId', (0, joi_1.ValidateJoi)(joi_1.Schemas.reward.update), reward_1.default.updateReward);
/**
 * @openapi
 * /admin/rewards/{rewardId}:
 *   delete:
 *     summary: Deletes a reward by ID
 *     tags: [Admin Rewards]
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.delete('/:rewardId', reward_1.default.deleteReward);
exports.default = router;
