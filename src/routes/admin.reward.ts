import express from 'express';
import controller from '../controllers/reward';
import { Schemas, ValidateJoi } from '../middleware/joi';

const router = express.Router();

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
router.post('/', ValidateJoi(Schemas.reward.create), controller.createReward);

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
router.get('/', controller.readAll);

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
router.get('/:rewardId', controller.readReward);

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
router.put('/:rewardId', ValidateJoi(Schemas.reward.update), controller.updateReward);

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
router.delete('/:rewardId', controller.deleteReward);

export default router;