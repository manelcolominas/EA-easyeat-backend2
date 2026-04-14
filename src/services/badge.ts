import mongoose from 'mongoose';
import { BadgeModel, IBadge } from '../models/badge';

const createBadge = async (data: Partial<IBadge>) => {
    const badge = new BadgeModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });

    return await badge.save();
};

const getBadge = async (badge_id: string) => {
    return await BadgeModel.findById(badge_id);
};

const getAllBadges = async (): Promise<IBadge[]> => {
    return await BadgeModel.find()
};

const updateBadge = async (badge_id: string, data: Partial<IBadge>) => {
    const badge = await BadgeModel.findById(badge_id);

    if (badge) {
        badge.set(data);
        return await badge.save();
    }

    return null;
};

const deleteBadge = async (badge_id: string) => {
    return await BadgeModel.findByIdAndDelete(badge_id);
};

export default {
    createBadge,
    getBadge,
    getAllBadges,
    updateBadge,
    deleteBadge
};
