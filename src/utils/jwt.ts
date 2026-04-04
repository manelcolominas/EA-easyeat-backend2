import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface TokenPayload {
    id: string;
    role: 'customer' | 'staff' | 'owner' | 'admin';
    modelType: 'customer' | 'employee' | 'admin';
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.token.secret, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.token.secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.token.secret) as TokenPayload;
};
