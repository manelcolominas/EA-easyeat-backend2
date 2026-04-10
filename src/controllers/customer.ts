import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CustomerService from '../services/customer';
import { CustomerModel } from '../models/customer';
import { config } from '../config/config';

// ─── Create ───────────────────────────────────────────────────────────────────

const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedCustomer = await CustomerService.createCustomer(req.body);
        return res.status(201).json(savedCustomer);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────

const loginCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const customer = await CustomerModel.findOne({ email }).active().select('+password');
        if (!customer) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: customer._id, type: 'customer' },
            config.token.secret || 'supersecret',
            { expiresIn: '7d' }
        );
        return res.status(200).json({
            message: 'Auth successful',
            token,
            customer: {
                id: customer._id,
                email: customer.email,
                name: customer.name
            }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Read (single) ────────────────────────────────────────────────────────────

const readCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const customer = await CustomerService.getCustomer(customerId);
        return customer
            ? res.status(200).json(customer)
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readCustomerFull = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const customer = await CustomerService.getCustomerFull(customerId);
        return customer
            ? res.status(200).json(customer)
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllBadges = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const badges = await CustomerService.getCustomerAllBadges(customerId);
        return res.status(200).json(badges);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllFavouriteRestaurants = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const restaurants = await CustomerService.getCustomerAllFavouriteRestaurants(customerId);
        return res.status(200).json(restaurants);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllReviews = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const reviews = await CustomerService.getCustomerAllReviews(customerId);
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllVisits = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const visits = await CustomerService.getCustomerAllVisits(customerId);
        return res.status(200).json(visits);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getCustomerAllPointsWallet = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const pointsWallet = await CustomerService.getCustomerAllPointsWallet(customerId);
        return res.status(200).json(pointsWallet);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Read (paginated list) ────────────────────────────────────────────────────

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    // Accept ?page=1&limit=20 query params
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 20);

    try {
        const result = await CustomerService.getAllCustomers({ page, limit });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const updatedCustomer = await CustomerService.updateCustomer(customerId, req.body);
        return updatedCustomer
            ? res.status(200).json(updatedCustomer)
            : res.status(404).json({ message: 'Customer not found or already deleted' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

/**
 * DELETE /customers/:customerId
 * Marks the customer as inactive without removing the document.
 */
const softDeleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.params.customerId || (req as any).customer?.id;
    try {
        const customer = await CustomerService.softDeleteCustomer(customerId);
        return customer
            ? res.status(200).json({ message: 'Customer deactivated', customer })
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Restore ─────────────────────────────────────────────────────────────────

/**
 * PATCH /customers/:customerId/restore
 * Reverses a soft-delete, making the customer active again.
 */
const restoreCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params;
    try {
        const customer = await CustomerService.restoreCustomer(customerId);
        return customer
            ? res.status(200).json({ message: 'Customer restored', customer })
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// ─── Hard Delete (admin only) ─────────────────────────────────────────────────

/**
 * DELETE /customers/:customerId/hard
 * Permanently removes the document. Requires admin privileges.
 */
const hardDeleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params;
    try {
        const customer = await CustomerService.hardDeleteCustomer(customerId);
        return customer
            ? res.status(200).json({ message: 'Customer permanently deleted' })
            : res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createCustomer,
    loginCustomer,
    readCustomer,
    readCustomerFull,
    getCustomerAllBadges,
    getCustomerAllFavouriteRestaurants,
    getCustomerAllPointsWallet,
    getCustomerAllReviews,
    getCustomerAllVisits,
    readAll,
    updateCustomer,
    softDeleteCustomer,
    restoreCustomer,
    hardDeleteCustomer,
};