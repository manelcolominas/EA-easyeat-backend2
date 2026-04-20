import mongoose from 'mongoose';
import { PointsWalletModel, IPointsWallet } from '../models/pointsWallet';
import { CustomerModel } from '../models/customer';

const createPointsWallet = async (data: Partial<IPointsWallet>) => {
    const wallet = new PointsWalletModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });

    const savedWallet = await wallet.save();

    if (data.customer_id) {
        await CustomerModel.findByIdAndUpdate(data.customer_id, {
            $push: { pointsWallet: savedWallet._id }
        });
    }

    return savedWallet;
};

const getPointsWallet = async (walletId: string) => {
    return await PointsWalletModel.findById(walletId);
};

const getAllPointsWallets = async (skip: number, limit: number): Promise<{ wallets:IPointsWallet[], total: number }> => {
    const [wallets, total] = await Promise.all([
        PointsWalletModel.find().lean().skip(skip).limit(limit),
        PointsWalletModel.countDocuments()
    ]);
    return { wallets, total };
}

const updatePointsWallet = async (walletId: string, data: Partial<IPointsWallet>) => {
    const wallet = await PointsWalletModel.findById(walletId);

    if (wallet) {
        wallet.set(data);
        return await wallet.save();
    }

    return null;
};

const deletePointsWallet = async (walletId: string) => {
    const deletedWallet = await PointsWalletModel.findByIdAndDelete(walletId);

    if (deletedWallet && deletedWallet.customer_id) {
        await CustomerModel.findByIdAndUpdate(deletedWallet.customer_id, {
            $pull: { pointsWallet: deletedWallet._id }
        });
    }

    return deletedWallet;
};

export default { createPointsWallet, getPointsWallet, getAllPointsWallets, updatePointsWallet, deletePointsWallet };
