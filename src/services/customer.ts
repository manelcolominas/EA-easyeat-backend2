import mongoose from 'mongoose';
import { CustomerModel, ICustomer } from '../models/customer';
import { softDeleteDocument, restoreDocument } from '../utils/softDelete';
import { PointsWalletModel, IPointsWallet } from '../models/pointsWallet';
import { VisitModel, IVisit } from '../models/visit';
import { RestaurantModel } from '../models/restaurant';
import { BadgeModel, IBadge } from '../models/badge';
import { ReviewModel, IReview } from '../models/review';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationOptions {
    page?:  number;   // 1-based, default 1
    limit?: number;   // default 20
}

export interface PaginatedResult<T> {
    data: T[]; total: number;
    page: number;
    totalPages: number;
}

// ─── Create ───────────────────────────────────────────────────────────────────

const createCustomer = async (data: Partial<ICustomer>) => {
    const customer = new CustomerModel({
        _id: new mongoose.Types.ObjectId(),
        ...data,
    });
    return customer.save();
};

// ─── Read (single) ────────────────────────────────────────────────────────────

const getCustomer = async (customer_id: string, includeDeleted = false) => {
    const query = CustomerModel.findById(customer_id);
    return includeDeleted ? query : query.active();
};

// src/services/customer.ts (or wherever your service layer is)

const getCustomerFull = async (customer_id: string, includeDeleted = false) => {
    const query = CustomerModel.findById(customer_id)
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

    return includeDeleted ? query : query.active();
};

// ─── Get all points wallets for a customer ────────────────────────────────────

const getCustomerAllPointsWallet = async (customer_id: string): Promise<IPointsWallet[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customer_id).active();
        if (!customer) {
            return [];
        }

        // Fetch all points wallets for this customer
        return await PointsWalletModel.find({ customer_id: customer_id })
            .populate('restaurant_id', 'profile.name profile.location')
            .lean();
    } 
    catch (error) {
        console.error(`Error fetching points wallets for customer ${customer_id}:`, error);
        return [];
    }
};

// ─── Get all visits for a customer ────────────────────────────────────────────

const getCustomerAllVisits = async (customer_id: string): Promise<IVisit[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customer_id).active();
        if (!customer) {
            return [];
        }

        // Fetch all visits for this customer, excluding soft-deleted ones
        return await VisitModel.find({
            customer_id: customer_id,
            deletedAt: null,
        })
            .populate('restaurant_id', 'profile.name profile.rating profile.location.city')
            .sort({ createdAt: -1 })  // Most recent first
            .lean();
    } catch (error) {
        console.error(`Error fetching visits for customer ${customer_id}:`, error);
        return [];
    }
};

// ─── Get all favourite restaurants for a customer ────────────────────────────

const getCustomerAllFavouriteRestaurants = async (customer_id: string) => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customer_id)
            .active()
            .populate({
            path: 'favoriteRestaurants',
            select: 'profile.name profile.description profile.globalRating profile.category profile.image profile.location.city',
            transform: (doc) => {
                if (doc && doc.profile && doc.profile.image && Array.isArray(doc.profile.image)) {
                    doc.profile.image = doc.profile.image.slice(0, 3);
                }
                return doc;
            }
        });

        if (!customer || !customer.favoriteRestaurants) {
            return [];
        }

        return customer.favoriteRestaurants;
    }
     catch (error) {
        console.error(`Error fetching favourite restaurants for customer ${customer_id}:`, error);
        return [];
    }
};

// ─── Get all badges earned by a customer ──────────────────────────────────────

const getCustomerAllBadges = async (customer_id: string): Promise<IBadge[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return [];
    }

    try {
        // Fetch customer with populated badges
        const customer = await CustomerModel.findById(customer_id)
            .active()
            .populate<{ badges: IBadge[] }>({
                path: 'badges',
                select: 'title description type',
            })
            .lean();

        if (!customer || !customer.badges) {
            return [];
        }

        return customer.badges;
    } catch (error) {
        console.error(`Error fetching badges for customer ${customer_id}:`, error);
        return [];
    }
};

// ─── Get all reviews written by a customer ────────────────────────────────────

const getCustomerAllReviews = async (customer_id: string): Promise<IReview[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customer_id).active();
        if (!customer) {
            return [];
        }

        // Fetch all reviews by this customer, excluding soft-deleted ones
        return await ReviewModel.find({
            customer_id: customer_id,
            deletedAt: null,
            deleted: { $ne: true },
        })
            .populate('restaurant_id', 'profile.name profile.rating')
            .sort({ createdAt: -1 })  // Most recent first
            .lean();
    } catch (error) {
        console.error(`Error fetching reviews for customer ${customer_id}:`, error);
        return [];
    }
};

// ─── Read (paginated list — active only) ──────────────────────────────────────

const getAllCustomers = async ( { page = 1, limit = 20 }: PaginationOptions = {} ): Promise<PaginatedResult<ICustomer>> => {
    const skip   = (page - 1) * limit;
    const filter = { deletedAt: null };
    const [data, total] = await Promise.all([ CustomerModel.find(filter).skip(skip).limit(limit).lean(), CustomerModel.countDocuments(filter) ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
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

// ─── Hard Delete ─────────────────────────────────────────────────────────────

const hardDeleteCustomer = async (customer_id: string) => {
    return CustomerModel.findByIdAndDelete(customer_id);
};

export default {
    createCustomer,
    getCustomer,
    getCustomerFull,
    getAllCustomers,
    getCustomerAllBadges,
    getCustomerAllFavouriteRestaurants,
    getCustomerAllPointsWallet,
    getCustomerAllReviews,
    getCustomerAllVisits,
    updateCustomer,
    softDeleteCustomer,
    restoreCustomer,
    hardDeleteCustomer,
};