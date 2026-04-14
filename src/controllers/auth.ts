import { Request, Response } from 'express';
import { AdminModel } from '../models/admin';
import { validateAdminCredentials, validateCustomerCredentials, validateEmployeeCredentials, getTokens } from '../services/auth';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { config } from '../config/config';
import Logging from '../library/logging';

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password, role = 'admin' } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (role === 'customer') {
            const customer = await validateCustomerCredentials(email, password);
            if (!customer) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const accessToken = generateAccessToken(String(customer._id), customer.name, customer.email, 'customer');
            const refreshToken = generateRefreshToken(String(customer._id), customer.name, customer.email, 'customer');

            res.cookie(config.cookies.refreshName, refreshToken, config.cookies.options);

            return res.status(200).json({
                message: 'Auth successful',
                accessToken,
                customer: {
                    id:    customer._id,
                    email: customer.email,
                    name:  customer.name,
                    role:  'customer',
                }
            });
        }

        if (role === 'employee') {
            const employee = await validateEmployeeCredentials(email, password);
            if (!employee) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const name = employee.profile.name;
            const empEmail = employee.profile.email ?? email;
            const empRole = employee.profile.role ?? 'staff';
            const restaurantId = String(employee.restaurant_id); // Get the restaurant_id

            const accessToken = generateAccessToken(String(employee._id), name, empEmail, empRole, restaurantId);
            const refreshToken = generateRefreshToken(String(employee._id), name, empEmail, empRole, restaurantId);

            res.cookie(config.cookies.refreshName, refreshToken, config.cookies.options);

            return res.status(200).json({
                message: 'Auth successful',
                accessToken,
                employee: {
                    id:            employee._id,
                    name:          employee.profile.name,
                    email:         employee.profile.email,
                    role:          employee.profile.role,
                    restaurant_id: employee.restaurant_id,
                }
            });
        }

        // Default: admin login
        const admin = await validateAdminCredentials(email, password);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = getTokens(admin);

        res.cookie(config.cookies.refreshName, refreshToken, config.cookies.options);

        return res.status(200).json({
            message: 'Auth successful',
            accessToken,
            admin: {
                id:    admin._id,
                email: admin.email,
                name:  admin.name,
                role:  admin.role,
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }

        const existingAdmin = await AdminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Admin with this email already exists' });
        }

        // Pass plaintext password — the pre-save hook in admin.ts hashes it
        // automatically with bcrypt, identical to the customer and employee models.
        const admin = new AdminModel({ email, password, name });
        await admin.save();

        return res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id:    admin._id,
                email: admin.email,
                name:  admin.name,
                role:  admin.role
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const incomingRefreshToken: string | undefined = req.cookies?.[config.cookies.refreshName];

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const { verifyRefreshToken } = await import('../utils/jwt');
        const payload = verifyRefreshToken(incomingRefreshToken);

        if (payload.type !== 'refresh') {
            return res.status(401).json({ message: 'Invalid token type' });
        }

        const admin = await AdminModel.findById(payload.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Re-use the same service helper as loginAdmin — no duplicated token logic.
        const { accessToken } = getTokens(admin);

        return res.json({ accessToken });
    } catch {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

/**
 * POST /auth/logout
 * Clears the httpOnly refresh cookie, effectively ending the session.
 */
export const logout = (_req: Request, res: Response) => {
    res.clearCookie(config.cookies.refreshName, config.cookies.options);
    return res.status(200).json({ message: 'Logged out successfully' });
};

export default { loginAdmin, registerAdmin, refresh, logout };
