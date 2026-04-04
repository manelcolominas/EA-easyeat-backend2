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

const getCustomer = async (customerId: string, includeDeleted = false) => {
    const query = CustomerModel.findById(customerId);
    return includeDeleted ? query : query.active();
};

// src/services/customer.ts (or wherever your service layer is)

const getCustomerFull = async (customerId: string, includeDeleted = false) => {
    const query = CustomerModel.findById(customerId)
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

const getCustomerAllPointsWallet = async (customerId: string): Promise<IPointsWallet[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customerId).active();
        if (!customer) {
            return [];
        }

        // Fetch all points wallets for this customer
        return await PointsWalletModel.find({ customer_id: customerId })
            .populate('restaurant_id', 'profile.name profile.location')
            .lean();
    } 
    catch (error) {
        console.error(`Error fetching points wallets for customer ${customerId}:`, error);
        return [];
    }
};

// ─── Get all visits for a customer ────────────────────────────────────────────

const getCustomerAllVisits = async (customerId: string): Promise<IVisit[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customerId).active();
        if (!customer) {
            return [];
        }

        // Fetch all visits for this customer, excluding soft-deleted ones
        const visits = await VisitModel.find({
            customer_id: customerId,
            deletedAt: null,
        })
            .populate('restaurant_id', 'profile.name profile.globalRating profile.location.city')
            .sort({ createdAt: -1 })  // Most recent first
            .lean();

        return visits.map((v: any) => {
            if (v.restaurant_id && v.restaurant_id.profile) {
                v.restaurant_id.profile.rating = v.restaurant_id.profile.globalRating;
            }
            return v;
        });
    } catch (error) {
        console.error(`Error fetching visits for customer ${customerId}:`, error);
        return [];
    }
};

// ─── Get all favourite restaurants for a customer ────────────────────────────

const getCustomerAllFavouriteRestaurants = async (customerId: string) => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customerId)
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
        console.error(`Error fetching favourite restaurants for customer ${customerId}:`, error);
        return [];
    }
};

// ─── Get all badges earned by a customer ──────────────────────────────────────

const getCustomerAllBadges = async (customerId: string): Promise<IBadge[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return [];
    }

    try {
        // Fetch customer with populated badges
        const customer = await CustomerModel.findById(customerId)
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
        console.error(`Error fetching badges for customer ${customerId}:`, error);
        return [];
    }
};

// ─── Get all reviews written by a customer ────────────────────────────────────

const getCustomerAllReviews = async (customerId: string): Promise<IReview[]> => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return [];
    }

    try {
        // Check if customer exists and is active
        const customer = await CustomerModel.findById(customerId).active();
        if (!customer) {
            return [];
        }

        // Fetch all reviews by this customer, excluding soft-deleted ones
        const reviews = await ReviewModel.find({
            customer_id: customerId,
            deleted: false,
        })
            .populate('restaurant_id', 'profile.name profile.globalRating')
            .sort({ createdAt: -1 })  // Most recent first
            .lean();

        return reviews.map((r: any) => {
            r.rating = r.globalRating; // Alias review rating
            if (r.restaurant_id && r.restaurant_id.profile) {
                r.restaurant_id.profile.rating = r.restaurant_id.profile.globalRating;
            }
            return r;
        });
    } catch (error) {
        console.error(`Error fetching reviews for customer ${customerId}:`, error);
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

const updateCustomer = async (customerId: string, data: Partial<ICustomer>) => {
    const customer = await CustomerModel.findOne({ _id: customerId }).active();
    if (!customer) return null;
    customer.set(data);
    return customer.save();
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

const softDeleteCustomer = async (customerId: string) => {
    return softDeleteDocument(CustomerModel, customerId);
};

// ─── Restore ─────────────────────────────────────────────────────────────────

const restoreCustomer = async (customerId: string) => {
    return restoreDocument(CustomerModel, customerId);
};

// ─── Hard Delete ─────────────────────────────────────────────────────────────

const hardDeleteCustomer = async (customerId: string) => {
    return CustomerModel.findByIdAndDelete(customerId);
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