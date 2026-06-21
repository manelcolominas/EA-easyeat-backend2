import { VisitModel, IVisit } from '../models/visit';
import { pointsRedemption } from '../utils/pointsRedemption';

const createVisit = async (data: Partial<IVisit>): Promise<IVisit> => {
  const { _id, pointsEarned, deletedAt, ...visitData } = data;

  return await pointsRedemption(visitData);
};

const getVisit = async (visit_id: string): Promise<IVisit | null> => {
  return await VisitModel.findById(visit_id).populate('customer_id', 'name email').populate('restaurant_id', 'profile.name profile.location.city profile.location.address');
};

const getDeletedVisit = async (visit_id: string): Promise<IVisit | null> => {
  return await VisitModel.findOne({ _id: visit_id, deletedAt: { $ne: null } })
    .populate('customer_id', 'name email')
    .populate('restaurant_id', 'profile.name profile.location.city profile.location.address');
};

const getAllVisits = async (skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
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

const getAllDeletedVisits = async (skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
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

const getByCustomer = async (customer_id: string, skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
  const query = { customer_id, deletedAt: null };
  const [visits, total] = await Promise.all([
    VisitModel.find(query).populate('restaurant_id', 'profile.name profile.location.city profile.location.address').sort({ date: -1 }).skip(skip).limit(limit).lean<IVisit[]>(),
    VisitModel.countDocuments(query)
  ]);
  return { visits, total };
};

const getDeletedByCustomer = async (customer_id: string, skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
  const query = { customer_id, deletedAt: { $ne: null } };
  const [visits, total] = await Promise.all([
    VisitModel.find(query).populate('restaurant_id', 'profile.name profile.location.city profile.location.address').sort({ date: -1 }).skip(skip).limit(limit).lean<IVisit[]>(),
    VisitModel.countDocuments(query)
  ]);
  return { visits, total };
};

const getByRestaurant = async (restaurant_id: string, skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
  const query = { restaurant_id, deletedAt: null };
  const [visits, total] = await Promise.all([
    VisitModel.find(query).populate('customer_id', 'name email').sort({ date: -1 }).skip(skip).limit(limit).lean<IVisit[]>(),
    VisitModel.countDocuments(query)
  ]);
  return { visits, total };
};

const getDeletedByRestaurant = async (restaurant_id: string, skip: number, limit: number): Promise<{ visits: IVisit[]; total: number }> => {
  const query = { restaurant_id, deletedAt: { $ne: null } };
  const [visits, total] = await Promise.all([
    VisitModel.find(query).populate('customer_id', 'name email').sort({ date: -1 }).skip(skip).limit(limit).lean<IVisit[]>(),
    VisitModel.countDocuments(query)
  ]);
  return { visits, total };
};

const updateVisit = async (visit_id: string, data: Partial<IVisit>): Promise<IVisit | null> => {
  const visit = await VisitModel.findById(visit_id);

  if (visit) {
    visit.set(data);
    return await visit.save();
  }

  return null;
};

const softDeleteVisit = async (visit_id: string): Promise<IVisit | null> => {
  return await VisitModel.findByIdAndUpdate(visit_id, { deletedAt: new Date() }, { new: true }).lean();
};

const restoreVisit = async (visit_id: string): Promise<IVisit | null> => {
  return await VisitModel.findByIdAndUpdate(visit_id, { deletedAt: null }, { new: true }).lean();
};

const hardDeleteVisit = async (visit_id: string): Promise<IVisit | null> => {
  return await VisitModel.findByIdAndDelete(visit_id);
};

export default {
  createVisit,
  getVisit,
  getDeletedVisit,
  getAllVisits,
  getAllDeletedVisits,
  getByCustomer,
  getDeletedByCustomer,
  getByRestaurant,
  getDeletedByRestaurant,
  updateVisit,
  softDeleteVisit,
  restoreVisit,
  hardDeleteVisit
};
