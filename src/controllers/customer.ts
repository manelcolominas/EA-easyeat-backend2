import { NextFunction, Request, Response } from 'express';
import CustomerService from '../services/customer';
import { getPaginationOptions } from '../utils/pagination';

// ─── Create ───────────────────────────────────────────────────────────────────

const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedCustomer = await CustomerService.createCustomer(req.body);
        return res.status(201).json(savedCustomer);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Read (single) ────────────────────────────────────────────────────────────

const readCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const customer = await CustomerService.getCustomer(customer_id);
        return customer
            ? res.status(200).json(customer)
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDeletedCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const customer = await CustomerService.getDeletedCustomer(customer_id);
        return customer
            ? res.status(200).json(customer)
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readCustomerFull = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const customer = await CustomerService.getCustomerFull(customer_id);
        return customer
            ? res.status(200).json(customer)
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDeletedCustomerFull = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const customer = await CustomerService.getDeletedCustomerFull(customer_id);
        return customer
            ? res.status(200).json(customer)
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllBadges = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { badges, total } = await CustomerService.getCustomerAllBadges(customer_id, skip, limit);
        
        return res.status(200).json({
            data: badges,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllFavouriteRestaurants = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { favoriteRestaurants, total } = await CustomerService.getCustomerAllFavouriteRestaurants(customer_id, skip, limit);
        
        return res.status(200).json({
            data: favoriteRestaurants,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllReviews = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { reviews, total } = await CustomerService.getCustomerAllReviews(customer_id, skip, limit);
        
        return res.status(200).json({
            data: reviews,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllVisits = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await CustomerService.getCustomerAllVisits(customer_id, skip, limit);
        
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllDeletedVisits = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { visits, total } = await CustomerService.getCustomerAllDeletedVisits(customer_id, skip, limit);
        
        return res.status(200).json({
            data: visits,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllPointsWallet = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { pointsWallet, total } = await CustomerService.getCustomerAllPointsWallet(customer_id, skip, limit);
        
        return res.status(200).json({
            data: pointsWallet,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Read (paginated list) ────────────────────────────────────────────────────

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { data, total } = await CustomerService.getAllCustomers(skip, limit);
        
        return res.status(200).json({
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { data, total } = await CustomerService.getAllDeletedCustomers(skip, limit);
        
        return res.status(200).json({
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const updatedCustomer = await CustomerService.updateCustomer(customer_id, req.body);
        return updatedCustomer
            ? res.status(200).json(updatedCustomer)
            : res.status(404).json({ message: 'Customer not found or already deleted' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

/**
 * DELETE /customers/:customer_id
 * Marks the customer as inactive without removing the document.
 */
const softDeleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const customer = await CustomerService.softDeleteCustomer(customer_id);
        return customer
            ? res.status(200).json({ message: 'Customer deactivated', customer })
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Restore ─────────────────────────────────────────────────────────────────

/**
 * PATCH /customers/:customer_id/restore
 * Reverses a soft-delete, making the customer active again.
 */
const restoreCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const customer = await CustomerService.restoreCustomer(customer_id);
        return customer
            ? res.status(200).json({ message: 'Customer restored', customer })
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Hard Delete (admin only) ─────────────────────────────────────────────────

/**
 * DELETE /customers/:customer_id/hard
 * Permanently removes the document. Requires admin privileges.
 */
const hardDeleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customer_id } = req.params;
    try {
        const customer = await CustomerService.hardDeleteCustomer(customer_id);
        return customer
            ? res.status(200).json({ message: 'Customer permanently deleted' })
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createCustomer,
    readCustomer,
    readDeletedCustomer,
    readCustomerFull,
    readDeletedCustomerFull,
    getCustomerAllBadges,
    getCustomerAllFavouriteRestaurants,
    getCustomerAllPointsWallet,
    getCustomerAllReviews,
    getCustomerAllVisits,
    getCustomerAllDeletedVisits,
    readAll,
    readAllDeleted,
    updateCustomer,
    softDeleteCustomer,
    restoreCustomer,
    hardDeleteCustomer,
};
