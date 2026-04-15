import { NextFunction, Request, Response } from 'express';
import RewardRedemptionService from '../services/rewardRedemption';

const createRewardRedemption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = await RewardRedemptionService.createRewardRedemption(req.body);
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const redeemReward = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RewardRedemptionService.redeemReward(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(error?.status || 500).json({
      message: error?.message || 'Error redeeming reward'
    });
  }
};

const readRewardRedemption = async (req: Request, res: Response, next: NextFunction) => {
  const { redemptionId } = req.params;

  try {
    const redemption = await RewardRedemptionService.getRewardRedemption(redemptionId);
    return redemption
      ? res.status(200).json(redemption)
      : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      restaurant_id: req.query.restaurant_id as string | undefined,
      customer_id: req.query.customer_id as string | undefined,
      reward_id: req.query.reward_id as string | undefined
    };

    const redemptions = await RewardRedemptionService.getAllRewardRedemptions(filters);
    return res.status(200).json(redemptions);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { redemptionId } = req.params;
  const { status, employee_id, notes } = req.body;

  try {
    const updated = await RewardRedemptionService.updateStatus(redemptionId, {
      status,
      employee_id,
      notes
    });

    return updated
      ? res.status(200).json(updated)
      : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const updateRewardRedemption = async (req: Request, res: Response, next: NextFunction) => {
  const { redemptionId } = req.params;

  try {
    const updated = await RewardRedemptionService.updateRewardRedemption(redemptionId, req.body);
    return updated
      ? res.status(200).json(updated)
      : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const deleteRewardRedemption = async (req: Request, res: Response, next: NextFunction) => {
  const { redemptionId } = req.params;

  try {
    const redemption = await RewardRedemptionService.deleteRewardRedemption(redemptionId);
    return redemption
      ? res.status(200).json(redemption)
      : res.status(404).json({ message: 'not found' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export default {
  createRewardRedemption,
  redeemReward,
  readRewardRedemption,
  readAll,
  updateStatus,
  updateRewardRedemption,
  deleteRewardRedemption
};