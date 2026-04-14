import mongoose, { Types } from 'mongoose';
import { VisitModel, IVisit } from '../models/visit';

// ─── Create ───────────────────────────────────────────────────────────────────

const createVisit = async (data: Partial<IVisit>) => {
    const visit = new VisitModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });
    return await visit.save();
};

// ─── Read (single) ────────────────────────────────────────────────────────────

const getVisit = async (visit_id: string) => {
    const visit = await VisitModel.findOne({ _id: visit_id });
    if (!visit || visit.deletedAt) return null;
    return visit;
};

// ─── Read (collection, paginada) ─────────────────────────────────────────────

const getAllVisits = async (
    filters: { customer_id?: string; restaurant_id?: string; deletedAt?: any } = {},
    page:  number = 1,
    limit: number = 5
) => {
    const query: Record<string, any> = {};

    if (filters.customer_id)   query.customer_id   = new Types.ObjectId(filters.customer_id);
    if (filters.restaurant_id) query.restaurant_id = new Types.ObjectId(filters.restaurant_id);

    // ✅ Cubre deletedAt: null y documentos sin el campo (seed sin deletedAt)
    query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];

    const skip = (page - 1) * limit;

    const data = await VisitModel.find(query)
        .populate('customer_id')
        .populate('restaurant_id')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

    const total = await VisitModel.countDocuments(query);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

// ─── Read (full, populated) ───────────────────────────────────────────────────

const getVisitFull = async (visit_id: string) => {
    const visit = await VisitModel.findOne({ _id: visit_id })
        .populate('customer_id')
        .populate('restaurant_id');
    if (!visit || visit.deletedAt) return null;
    return visit;
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateVisit = async (visit_id: string, data: Partial<IVisit>) => {
    // ✅ findByIdAndUpdate para soportar deletedAt en soft delete desde el frontend
    return await VisitModel.findByIdAndUpdate(visit_id, data, { new: true });
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

const softDeleteVisit = async (id: string) => {
    return await VisitModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
};

// ─── Hard Delete ─────────────────────────────────────────────────────────────

const hardDeleteVisit = async (id: string) => {
    return await VisitModel.findByIdAndDelete(id);
};

// deleteVisit → hard delete (el controlador lo usa para DELETE /visits/:id)
const deleteVisit = hardDeleteVisit;

export default {
    createVisit,
    getVisit,
    getAllVisits,
    getVisitFull,
    updateVisit,
    deleteVisit,
    softDeleteVisit,
    hardDeleteVisit,
};