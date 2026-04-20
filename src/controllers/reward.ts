import { NextFunction, Request, Response } from 'express';
import RewardService from '../services/reward';
import { getPaginationOptions } from '../utils/pagination';

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

const readDeletedReward = async (req: Request, res: Response, next: NextFunction) => {
    const reward_id = req.params.reward_id;

    try {
        const reward = await RewardService.getDeletedReward(reward_id);
        return reward ? res.status(200).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { rewards, total } = await RewardService.getAllRewards(skip, limit);
        return res.status(200).json({
            data: rewards,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { rewards, total } = await RewardService.getAllDeletedRewards(skip, limit);
        return res.status(200).json({
            data: rewards,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
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

const softDeleteReward = async (req: Request, res: Response, next: NextFunction) => {
    const reward_id = req.params.reward_id;
    try {
        const reward = await RewardService.softDeleteReward(reward_id);
        return reward ? res.status(201).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const restoreReward = async (req: Request, res: Response, next: NextFunction) => {
    const reward_id = req.params.reward_id;
    try {
        const reward = await RewardService.restoreReward(reward_id);
        return reward ? res.status(201).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const hardDeleteReward = async (req: Request, res: Response, next: NextFunction) => {
    const reward_id = req.params.reward_id;
    try {
        const reward = await RewardService.hardDeleteReward(reward_id);
        return reward ? res.status(201).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createReward,
    readReward,
    readDeletedReward,
    readAll,
    readAllDeleted,
    updateReward,
    softDeleteReward,
    restoreReward,
    hardDeleteReward
};
