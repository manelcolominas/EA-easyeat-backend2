import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../config/config";
import { IJwtPayload } from "../models/JWTPayload";

export const generateAccessToken = (admin_id: string, name: string, email: string, role: string, restaurant_id?: string) => {
    const payload: IJwtPayload = { id: admin_id, name, email, role, type: 'access', restaurant_id };
    return jwt.sign(
        payload,
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"] }
    );
};

export const generateRefreshToken = (admin_id: string, name: string, email: string, role: string, restaurant_id?: string) => {
    const payload: IJwtPayload = { id: admin_id, name, email, role, type: 'refresh', restaurant_id };
    return jwt.sign(
        payload,
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"] }
    );
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.jwt.accessSecret) as IJwtPayload;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.jwt.refreshSecret) as IJwtPayload;
};