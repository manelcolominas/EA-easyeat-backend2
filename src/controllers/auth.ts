import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/admin';
import { CustomerModel } from '../models/customer';
import { EmployeeModel } from '../models/employee';
import { config } from '../config/config';
import Logging from '../library/logging';

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await AdminModel.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, type: 'admin' },
            config.token.secret,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: 'Auth successful',
            accessToken: token,
            user: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: 'admin'
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

        const admin = new AdminModel({ email, password, name });

        await admin.save();

        return res.status(201).json({
            message: 'Admin created successfully',
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

export const registerCustomer = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }

        const existingCustomer = await CustomerModel.findOne({ email });

        if (existingCustomer) {
            return res.status(409).json({ message: 'Customer with this email already exists' });
        }

        const customer = new CustomerModel({ email, password, name });
        await customer.save();

        const token = jwt.sign(
            { id: customer._id, type: 'customer' },
            config.token.secret,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            message: 'Customer created successfully',
            accessToken: token,
            user: {
                id: customer._id,
                email: customer.email,
                name: customer.name,
                role: 'customer'
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginCustomer = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const customer = await CustomerModel.findOne({ email, deletedAt: null }).select('+password');

        if (!customer) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await customer.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: customer._id, type: 'customer' },
            config.token.secret,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: 'Auth successful',
            accessToken: token,
            user: {
                id: customer._id,
                email: customer.email,
                name: customer.name,
                role: 'customer'
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginEmployee = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const employee = await EmployeeModel.findOne({ 'profile.email': email, isActive: true }).select('+profile.password');

        if (!employee) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await employee.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: employee._id,
                type: 'employee',
                restaurant_id: employee.restaurant_id,
                role: employee.profile.role
            },
            config.token.secret,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: 'Auth successful',
            accessToken: token,
            user: {
                id: employee._id,
                email: employee.profile.email,
                name: employee.profile.name,
                role: employee.profile.role,
                restaurant_id: employee.restaurant_id
            }
        });
    } catch (error) {
        Logging.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    return res.status(401).json({ message: 'No refresh token provided' });
};

export const logout = async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'Logged out' });
};

export default { loginAdmin, registerAdmin, registerCustomer, loginCustomer, loginEmployee, refreshToken, logout };