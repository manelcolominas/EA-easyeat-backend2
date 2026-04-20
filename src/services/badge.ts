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

const getDeletedBadge = async (badge_id: string) => {
    return await BadgeModel.findOne({ _id: badge_id, deletedAt: { $ne: null } });
};

const getAllBadges = async (skip: number, limit: number): Promise<{ badges: IBadge[], total: number}> => {
    const [badges, total] = await Promise.all([
        BadgeModel.find({ deletedAt: null }).skip(skip).limit(limit), 
        BadgeModel.countDocuments({ deletedAt: null })
    ]);
    return { badges, total };
};

const getAllDeletedBadges = async (skip: number, limit: number): Promise<{ badges: IBadge[], total: number}> => {
    const [badges, total] = await Promise.all([
        BadgeModel.find({ deletedAt: { $ne: null } }).skip(skip).limit(limit),
        BadgeModel.countDocuments({ deletedAt: { $ne: null } })
    ]);
    return { badges, total };
};

const updateBadge = async (badge_id: string, data: Partial<IBadge>) => {
    const badge = await BadgeModel.findById(badge_id);

    if (badge) {
        badge.set(data);
        return await badge.save();
    }

    return null;
};

const softDeleteBadge = async (badge_id: string) => {
    return await BadgeModel.findByIdAndUpdate(badge_id, { deletedAt: new Date() }, { new: true }).lean();
};

const restoreBadge = async (badge_id: string) => {
    return await BadgeModel.findByIdAndUpdate(badge_id, { deletedAt: null }, { new: true }).lean();
};

const hardDeleteBadge = async (badge_id: string) => {
    return await BadgeModel.findByIdAndDelete(badge_id);
};

export default {
    createBadge,
    getBadge,
    getDeletedBadge,
    getAllBadges,
    getAllDeletedBadges,
    updateBadge,
    softDeleteBadge,
    restoreBadge,
    hardDeleteBadge,
};
