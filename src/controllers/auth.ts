import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { CustomerModel } from '../models/customer';
import { EmployeeModel } from '../models/employee';
import { AdminModel } from '../models/admin';
import { generateAccessToken, generateRefreshToken, verifyToken, TokenPayload } from '../utils/jwt';
import Logging from '../library/logging';

// ─── Login Customer ──────────────────────────────────────────────────────────
export const loginCustomer = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const customer = await CustomerModel.findOne({ email }).active().select('+password');
        if (!customer || !(await customer.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload: TokenPayload = { id: customer._id.toString(), role: 'customer', modelType: 'customer' };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            accessToken,
            user: { 
                id: customer._id, 
                email: customer.email, 
                name: customer.name, 
                role: 'customer',
                favoriteRestaurants: customer.favoriteRestaurants || []
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── Login Employee (Owner / Staff) ──────────────────────────────────────────
export const loginEmployee = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const employee = await EmployeeModel.findOne({ 'profile.email': email }).select('+profile.password');
        if (!employee || !(await employee.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const role = employee.profile.role as 'owner' | 'staff';
        const payload: TokenPayload = { id: employee._id.toString(), role, modelType: 'employee' };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            accessToken,
            user: { 
                id: employee._id, 
                email: employee.profile.email, 
                name: employee.profile.name, 
                role,
                restaurant_id: employee.restaurant_id
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── Refresh Token ───────────────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

        const decoded = verifyToken(refreshToken);
        
        // Verify user still exists and is active
        let userDoc: any = null;
        if (decoded.modelType === 'customer') {
            userDoc = await CustomerModel.findById(decoded.id).active();
        } else if (decoded.modelType === 'employee') {
            userDoc = await EmployeeModel.findById(decoded.id);
        } else if (decoded.modelType === 'admin') {
            userDoc = await AdminModel.findById(decoded.id);
        }

        if (!userDoc) return res.status(401).json({ message: 'User not found or inactive' });

        const user = {
            id: userDoc._id,
            email: userDoc.email || userDoc.profile?.email,
            name: userDoc.name || userDoc.profile?.name,
            role: decoded.role,
            favoriteRestaurants: userDoc.favoriteRestaurants || [],
            ...(userDoc.restaurant_id ? { restaurant_id: userDoc.restaurant_id } : {})
        };

        const newAccessToken = generateAccessToken({ id: decoded.id, role: decoded.role, modelType: decoded.modelType });
        return res.status(200).json({ 
            accessToken: newAccessToken, 
            token: newAccessToken,
            user 
        });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully' });
};

// ─── Login Admin (Backoffice) ────────────────────────────────────────────────
export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const admin = await AdminModel.findOne({ email }).select('+password');
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload: TokenPayload = { id: admin._id.toString(), role: 'admin', modelType: 'admin' };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            token: accessToken,
            accessToken: accessToken,
            admin: { 
                id: admin._id, 
                email: admin.email, 
                name: admin.name
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default { loginCustomer, loginEmployee, loginAdmin, refresh, logout };
