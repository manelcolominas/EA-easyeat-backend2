import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import Logging from '../library/logging';

// Extend Express Request type
export interface AuthRequest extends Request {
    user?: TokenPayload;
}

// ─── Verify Access Token ─────────────────────────────────────────────────────
export const verifyTokenMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        Logging.info(`AuthMiddleware: Incoming Authorization Header: [${authHeader ? 'present' : 'missing'}]`);
        if (authHeader) Logging.info(`AuthMiddleware: Header starts with Bearer: [${authHeader.startsWith('Bearer ')}]`);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Authentication required' });

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        Logging.error(error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// ─── Verify Role (RBAC) ──────────────────────────────────────────────────────
export const verifyRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

// ─── Optional Auth ──────────────────────────────────────────────────────────
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            req.user = decoded;
        }
        next();
    } catch (error) {
        // Just proceed without user info on error
        next();
    }
};

// Deprecated legacy middleware for backward compatibility during migration
export const requireAdmin = verifyRole(['admin', 'owner']);
export default { verifyTokenMiddleware, verifyRole, optionalAuth };
