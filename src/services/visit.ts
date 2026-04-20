import mongoose from 'mongoose';
import { VisitModel, IVisit } from '../models/visit';

const createVisit = async (data: Partial<IVisit>) => {
    const visit = new VisitModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });
    return await visit.save();
};

const getVisit = async (visit_id: string) => {
    return await VisitModel.findById(visit_id)
        .populate('customer_id', 'name email')
        .populate('restaurant_id', 'profile.name profile.location.city profile.location.address');
};

const getDeletedVisit = async (visit_id: string) => {
    return await VisitModel.findOne({ _id: visit_id, deletedAt: { $ne: null } })
        .populate('customer_id', 'name email')
        .populate('restaurant_id', 'profile.name profile.location.city profile.location.address');
};

const getAllVisits = async (skip: number, limit: number): Promise<{ visits: IVisit[], total: number }> => {
    const query = { deletedAt: null };
    const [visits, total] = await Promise.all([
        VisitModel.find(query)
            .populate('customer_id', 'name email')
            .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IVisit[]>(),
        VisitModel.countDocuments(query)
    ]);
    return { visits, total };
};

const getAllDeletedVisits = async (skip: number, limit: number): Promise<{ visits: IVisit[], total: number }> => {
    const query = { deletedAt: { $ne: null } };
    const [visits, total] = await Promise.all([
        VisitModel.find(query)
            .populate('customer_id', 'name email')
            .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IVisit[]>(),
        VisitModel.countDocuments(query)
    ]);
    return { visits, total };
};

const getByCustomer = async (customer_id: string, skip: number, limit: number) => {
    const query = { customer_id, deletedAt: null };
    const [visits, total] = await Promise.all([
        VisitModel.find(query)
            .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IVisit[]>(),
        VisitModel.countDocuments(query)
    ]);
    return { visits, total };
};

const getByRestaurant = async (restaurant_id: string, skip: number, limit: number) => {
    const query = { restaurant_id, deletedAt: null };
    const [visits, total] = await Promise.all([
        VisitModel.find(query)
            .populate('customer_id', 'name email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IVisit[]>(),
        VisitModel.countDocuments(query)
    ]);
    return { visits, total };
};

const updateVisit = async (visit_id: string, data: Partial<IVisit>) => {
    const visit = await VisitModel.findById(visit_id);

    if (visit) {
        visit.set(data);
        return await visit.save();
    }

    return null;
};

const softDeleteVisit = async (visit_id: string) => {
    return await VisitModel.findByIdAndUpdate(visit_id, { deletedAt: new Date() }, { new: true }).lean();
};

const restoreVisit = async (visit_id: string) => {
    return await VisitModel.findByIdAndUpdate(visit_id, { deletedAt: null }, { new: true }).lean();
};

const hardDeleteVisit = async (visit_id: string) => {
    return await VisitModel.findByIdAndDelete(visit_id);
};

export default {
    createVisit,
    getVisit,
    getDeletedVisit,
    getAllVisits,
    getAllDeletedVisits,
    getByCustomer,
    getByRestaurant,
    updateVisit,
    softDeleteVisit,
    restoreVisit,
    hardDeleteVisit,
};
