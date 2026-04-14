import { AdminModel} from '../models/admin';
import { CustomerModel } from '../models/customer';
import { EmployeeModel } from '../models/employee';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const validateAdminCredentials = async (email: string, password: string) => {
    const admin = await AdminModel.findOne({ email }).select('+password');
    if (!admin) return null;

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return null;

    return admin;
};

export const validateCustomerCredentials = async (email: string, password: string) => {
    const customer = await CustomerModel.findOne({ email, deletedAt: null }).select('+password');
    if (!customer) return null;

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) return null;

    return customer;
};

export const validateEmployeeCredentials = async (email: string, password: string) => {
    const employee = await EmployeeModel.findOne({ 'profile.email': email, isActive: true }).select('+profile.password');
    if (!employee) return null;

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) return null;

    return employee;
};

export const getTokens = (admin: any) => {
    const accessToken = generateAccessToken(
        String(admin._id),
        admin.name,
        admin.email,
        admin.role
    );
    const refreshToken = generateRefreshToken(
        String(admin._id),
        admin.name,
        admin.email,
        admin.role
    );
    return { accessToken, refreshToken };
};

export const refreshadminSession = async (incomingRefreshToken: string) => {
    const payload = verifyRefreshToken(incomingRefreshToken);
    if (payload.type !== 'refresh') throw new Error('Invalid token type');
    const admin = await AdminModel.findById(payload.id);
    if (!admin) throw new Error('Admin not found');
    return getTokens(admin);
};
