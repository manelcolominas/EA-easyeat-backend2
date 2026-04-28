import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { IJwtPayload } from '../models/JWTPayload';

export interface AuthRequest extends Request {
    user?: IJwtPayload;
}

const normalizeRole = (role?: string) => (typeof role === 'string' ? role.trim().toLowerCase() : '');

/**
 * Verifies the Bearer access token and attaches the decoded payload to `req.user`.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
        const cookieToken = (req as Request & { cookies?: { accessToken?: string } }).cookies?.accessToken;
        const token = bearerToken || cookieToken;

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = verifyAccessToken(token);

        if (decoded.type !== 'access') {
            console.log('AUTH REJECTED: invalid token type', decoded.type);
            return res.status(401).json({ message: 'Invalid token type' });
        }

        if (!decoded?.id || !decoded?.email || !decoded?.role) {
            console.log('AUTH REJECTED: invalid token payload', decoded);
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        decoded.role = normalizeRole(decoded.role);

        req.user = decoded;
        next();
    } catch {
        console.log('AUTH VERIFY FAILED');
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/**
 * RBAC middleware: check if user has one of the allowed roles.
 * Admins ALWAYS have access (Bypass).
 */
export const requireRole = (...roles: string[]) => {
    const normalizedAllowedRoles = roles.map(normalizeRole).filter(Boolean);

    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!normalizedAllowedRoles.length) {
            return res.status(500).json({ message: 'Role middleware misconfigured: no roles provided' });
        }

        const currentRole = normalizeRole(req.user.role);

        if (!currentRole) {
            return res.status(403).json({ message: 'Access denied: missing role in token payload' });
        }

        // Admin bypass
        if (currentRole === 'admin') {
            return next();
        }

        if (!normalizedAllowedRoles.includes(currentRole)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${normalizedAllowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Ownership middleware: allows access if the user is an admin OR if the
 * requested resource ID matches the authenticated user's ID.
 * Expected parameter name in req.params: 'userId' or 'customer_id'
 */
export const requireSelfOrAdmin = (paramName: string = 'userId') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });

        const resourceId = req.params[paramName];
        const isOwner = req.user.id === resourceId;
        const isAdmin = normalizeRole(req.user.role) === 'admin';

        if (isAdmin || isOwner) {
            return next();
        }

        return res.status(403).json({ message: 'Access denied: You can only access your own data' });
    };
};

/**
 * Multi-tenant middleware: ensures the user belongs to the restaurant they are trying to access.
 * Admins ALWAYS have access.
 * Owners and Staff must match the restaurant_id.
 */
export const requireRestaurantAccess = (paramName: string = 'restaurant_id') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });

        // Admin bypass
        if (normalizeRole(req.user.role) === 'admin') return next();

        const targetrestaurant_id = req.params[paramName] || req.body[paramName] || req.query[paramName];
        
        if (!req.user.restaurant_id || String(req.user.restaurant_id) !== String(targetrestaurant_id)) {
            return res.status(403).json({ message: 'Access denied: You do not have access to this restaurant' });
        }

        next();
    };
};

// Convenience shorthands
export const isAdmin = [authenticate, requireRole('admin')];
export const isOwner = [authenticate, requireRole('owner')];
export const isStaff = [authenticate, requireRole('staff')];
export const isCustomer = [authenticate, requireRole('customer')];
