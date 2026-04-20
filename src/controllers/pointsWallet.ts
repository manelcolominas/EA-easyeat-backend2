import { NextFunction, Request, Response } from 'express';
import PointsWalletService from '../services/pointsWallet';
import { getPaginationOptions } from '../utils/pagination';


const createPointsWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedWallet = await PointsWalletService.createPointsWallet(req.body);
        return res.status(201).json(savedWallet);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readPointsWallet = async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    try {
        const wallet = await PointsWalletService.getPointsWallet(walletId);
        return wallet ? res.status(200).json(wallet) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { wallets, total } = await PointsWalletService.getAllPointsWallets(skip, limit);
        return res.status(200).json({
            data: wallets,
            meta: { total: total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updatePointsWallet = async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    try {
        const updatedWallet = await PointsWalletService.updatePointsWallet(walletId, req.body);
        return updatedWallet ? res.status(201).json(updatedWallet) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deletePointsWallet = async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    try {
        const wallet = await PointsWalletService.deletePointsWallet(walletId);
        return wallet ? res.status(200).json(wallet) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default { createPointsWallet, readPointsWallet, readAll, updatePointsWallet, deletePointsWallet };
