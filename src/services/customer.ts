import mongoose from 'mongoose';
import { CustomerModel, ICustomer } from '../models/customer';
import { softDeleteDocument, restoreDocument } from '../utils/softDelete';
import { PointsWalletModel, IPointsWallet } from '../models/pointsWallet';
import { VisitModel, IVisit } from '../models/visit';
import { RestaurantModel, IRestaurant } from '../models/restaurant';
import { BadgeModel, IBadge } from '../models/badge';
import { ReviewModel, IReview } from '../models/review';

// ─── Create ───────────────────────────────────────────────────────────────────

const createCustomer = async (data: Partial<ICustomer>) => {
    const customer = new CustomerModel({
        _id: new mongoose.Types.ObjectId(),
        ...data,
    });
    return customer.save();
};

// ─── Read (single) ────────────────────────────────────────────────────────────

const getCustomer = async (customer_id: string) => {
    return CustomerModel.findById(customer_id);
};

const getDeletedCustomer = async (customer_id: string) => {
    return CustomerModel.findOne({ _id: customer_id, deletedAt: { $ne: null } });
};

const getCustomerFull = async (customer_id: string) => {
    return CustomerModel.findById(customer_id)
        .populate('pointsWallet')
        .populate('visitHistory')
        .populate({
            path: 'favoriteRestaurants',
            select: 'profile.name profile.description profile.globalRating profile.category profile.image profile.location.city',
            transform: (doc) => {
                if (doc && doc.profile && doc.profile.image && Array.isArray(doc.profile.image)) {
                    doc.profile.image = doc.profile.image.slice(0, 3);
                }
                return doc;
            }
        })
        .populate('badges')
        .populate('reviews');
};

const getDeletedCustomerFull = async (customer_id: string) => {
    return CustomerModel.findOne({ _id: customer_id, deletedAt: { $ne: null } })
        .populate('pointsWallet')
        .populate('visitHistory')
        .populate({
            path: 'favoriteRestaurants',
            select: 'profile.name profile.description profile.globalRating profile.category profile.image profile.location.city',
            transform: (doc) => {
                if (doc && doc.profile && doc.profile.image && Array.isArray(doc.profile.image)) {
                    doc.profile.image = doc.profile.image.slice(0, 3);
                }
                return doc;
            }
        })
        .populate('badges')
        .populate('reviews');
};

// ─── Get all points wallets for a customer ────────────────────────────────────

const getCustomerAllPointsWallet = async (customer_id: string, skip: number, limit: number): Promise<{ pointsWallet: IPointsWallet[], total: number }> => {
    const filter = { customer_id: customer_id };
    const [pointsWallet, total] = await Promise.all([
        PointsWalletModel.find(filter)
            .populate('restaurant_id', 'profile.name profile.location')
            .skip(skip)
            .limit(limit)
            .lean<IPointsWallet[]>(),
        PointsWalletModel.countDocuments(filter)
    ]);

    return { pointsWallet, total };
};

// ─── Get all visits for a customer ────────────────────────────────────────────

const getCustomerAllVisits = async (customer_id: string, skip: number, limit: number): Promise<{ visits: IVisit[], total: number }> => {
    const filter = { customer_id: customer_id, deletedAt: null };
    const [visits, total] = await Promise.all([
        VisitModel.find(filter)
            .populate('restaurant_id', 'profile.name profile.rating profile.location.city')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IVisit[]>(),
        VisitModel.countDocuments(filter)
    ]);
    return { visits, total };
};

const getCustomerAllDeletedVisits = async (customer_id: string, skip: number, limit: number): Promise<{ visits: IVisit[], total: number }> => {
    const filter = { customer_id: customer_id, deletedAt: { $ne: null } };
    const [visits, total] = await Promise.all([
        VisitModel.find(filter)
            .populate('restaurant_id', 'profile.name profile.rating profile.location.city')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IVisit[]>(),
        VisitModel.countDocuments(filter)
    ]);
    return { visits, total };
};

// ─── Get all favourite restaurants for a customer ────────────────────────────

const getCustomerAllFavouriteRestaurants = async ( customer_id: string, skip: number, limit: number ): Promise<{ favoriteRestaurants: IRestaurant[]; total: number }> => {
    const customer = await CustomerModel.findById(customer_id).active().select('favoriteRestaurants').lean();

    if (!customer || !customer.favoriteRestaurants || customer.favoriteRestaurants.length === 0) {
        return { favoriteRestaurants: [], total: 0 };
    }

    const filter = { _id: { $in: customer.favoriteRestaurants }, deletedAt: null };

    const [restaurants, total] = await Promise.all([
        RestaurantModel.find(filter)
            .select('profile.name profile.description profile.globalRating profile.category profile.image profile.location.city')
            .skip(skip)
            .limit(limit)
            .lean<IRestaurant[]>(),
        RestaurantModel.countDocuments(filter)
    ]);

    const favoriteRestaurants = restaurants.map((doc) => {
        if (doc?.profile?.image && Array.isArray(doc.profile.image)) {
            doc.profile.image = doc.profile.image.slice(0, 3);
        }
        return doc;
    });

    return { favoriteRestaurants, total };
};

// ─── Get all badges earned by a customer ──────────────────────────────────────

const getCustomerAllBadges = async (customer_id: string, skip: number, limit: number): Promise<{ badges: IBadge[], total: number }> => {
    const customer = await CustomerModel.findById(customer_id).active().select('badges').lean();

    if (!customer || !customer.badges || customer.badges.length === 0) {
        return { badges: [], total: 0 };
    }

    const filter = { _id: { $in: customer.badges }, deletedAt: null };

    const [badges, total] = await Promise.all([
        BadgeModel.find(filter)
            .select('title description type')
            .skip(skip)
            .limit(limit)
            .lean<IBadge[]>(),
        BadgeModel.countDocuments(filter)
    ]);

    return { badges, total };
};

// ─── Get all reviews written by a customer ────────────────────────────────────

const getCustomerAllReviews = async (customer_id: string, skip: number, limit: number): Promise<{ reviews: IReview[], total: number }> => {
    const filter = { customer_id: customer_id, deletedAt: null, deleted: { $ne: true } };
    const [reviews, total] = await Promise.all([
        ReviewModel.find(filter)
            .populate('restaurant_id', 'profile.name profile.rating')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IReview[]>(),
        ReviewModel.countDocuments(filter)
    ]);
    return { reviews, total };
};

// ─── Read (paginated list) ────────────────────────────────────────────────────

const getAllCustomers = async (skip: number, limit: number): Promise<{ data: ICustomer[], total: number }> => {
    const filter = { deletedAt: null };
    const [data, total] = await Promise.all([
        CustomerModel.find(filter).skip(skip).limit(limit).lean<ICustomer[]>(),
        CustomerModel.countDocuments(filter)
    ]);
    return { data, total };
};

const getAllDeletedCustomers = async (skip: number, limit: number): Promise<{ data: ICustomer[], total: number }> => {
    const filter = { deletedAt: { $ne: null } };
    const [data, total] = await Promise.all([
        CustomerModel.find(filter).skip(skip).limit(limit).lean<ICustomer[]>(),
        CustomerModel.countDocuments(filter)
    ]);
    return { data, total };
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateCustomer = async (customer_id: string, data: Partial<ICustomer>) => {
    const customer = await CustomerModel.findOne({ _id: customer_id }).active();
    if (!customer) return null;
    customer.set(data);
    return customer.save();
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

const softDeleteCustomer = async (customer_id: string) => {
    return softDeleteDocument(CustomerModel, customer_id);
};

// ─── Restore ─────────────────────────────────────────────────────────────────

const restoreCustomer = async (customer_id: string) => {
    return restoreDocument(CustomerModel, customer_id);
};

// ─── Hard Delete (admin only) ─────────────────────────────────────────────────

const hardDeleteCustomer = async (customer_id: string) => {
    return CustomerModel.findByIdAndDelete(customer_id);
};

export default {
    createCustomer,
    getCustomer,
    getDeletedCustomer,
    getCustomerFull,
    getDeletedCustomerFull,
    getAllCustomers,
    getAllDeletedCustomers,
    getCustomerAllBadges,
    getCustomerAllFavouriteRestaurants,
    getCustomerAllPointsWallet,
    getCustomerAllReviews,
    getCustomerAllVisits,
    getCustomerAllDeletedVisits,
    updateCustomer,
    softDeleteCustomer,
    restoreCustomer,
    hardDeleteCustomer,
};
