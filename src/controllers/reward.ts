import { NextFunction, Request, Response } from 'express';
import RewardService from '../services/reward';

const createReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedReward = await RewardService.createReward(req.body);
        return res.status(201).json(savedReward);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readReward = async (req: Request, res: Response, next: NextFunction) => {
    const reward_id = req.params.reward_id;

    try {
        const reward = await RewardService.getReward(reward_id);
        return reward ? res.status(200).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const rewards = await RewardService.getAllRewards(page, limit);
        return res.status(200).json(rewards);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateReward = async (req: Request, res: Response, next: NextFunction) => {
    const reward_id = req.params.reward_id;

    try {
        const updatedReward = await RewardService.updateReward(reward_id, req.body);
        return updatedReward ? res.status(201).json(updatedReward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteReward = async (req: Request, res: Response, next: NextFunction) => {
    const reward_id = req.params.reward_id;

    try {
        const reward = await RewardService.deleteReward(reward_id);
        return reward ? res.status(201).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createReward,
    readReward,
    readAll,
    updateReward,
    deleteReward
};