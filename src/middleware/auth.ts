import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { EmployeeModel } from '../models/employee';
import mongoose from 'mongoose';
import { IJwtPayload } from '../models/JWTPayload';
import { CustomerModel } from '../models/customer';
import Logging from '../library/logging';

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
      Logging.error('AUTH REJECTED: invalid token type', decoded.type);
      return res.status(401).json({ message: 'Invalid token type' });
    }

    if (!decoded?.id || !decoded?.email || !decoded?.role) {
      Logging.error('AUTH REJECTED: invalid token payload', decoded);
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    decoded.role = normalizeRole(decoded.role);

    req.user = decoded;
    next();
  } catch (error) {
    Logging.error('AUTH VERIFY FAILED', error);
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
 * Access middleware: allows access if the user is an admin OR if the
 * requested resource ID matches the authenticated user's ID.
 * OR if the user is owner/staff of the restaurant the customer belongs to.
 */
export const requireCustomerAccess = (paramName: string = 'customer_id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });

    const customerId = req.params[paramName];
    const role = normalizeRole(req.user.role);

    // 1. Admin bypass
    if (role === 'admin') return next();

    // 2. Self access
    if (req.user.id === customerId) return next();

    // 3. Restaurant management access
    if (['owner', 'staff'].includes(role) && req.user.restaurant_id) {
      try {
        // Fetch customer to check their favoriteRestaurants
        const customer = await CustomerModel.findById(customerId).select('favoriteRestaurants').lean();

        if (!customer) {
          return res.status(404).json({ message: 'Customer not found' });
        }

        const restaurantId = String(req.user.restaurant_id);
        const belongsToRestaurant = customer.favoriteRestaurants?.some((id) => String(id) === restaurantId);

        if (belongsToRestaurant) {
          return next();
        }
      } catch (error) {
        Logging.error('Error in requireCustomerAccess:', error);
        return res.status(500).json({ message: 'Internal server error during authorization' });
      }
    }

    return res.status(403).json({ message: 'Access denied: You do not have permission to access this customer data' });
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

/**
 * Allows access if:
 *  - admin (bypass)
 *  - owner and the requested employee belongs to the same restaurant as req.user.restaurant_id
 *  - the employee themself (req.user.id === employee_id)
 *
 * Usage: requireEmployeeOwnerOrSelfOrAdmin('employee_id')
 */
export const requireEmployeeOwnerOrSelfOrAdmin = (paramName: string = 'employee_id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });

    const currentRole = normalizeRole(req.user.role);
    // Admin bypass
    if (currentRole === 'admin') return next();

    const employeeId = req.params[paramName];
    if (!employeeId) return res.status(400).json({ message: 'Missing employee id' });

    // Self check
    if (String(req.user.id) === String(employeeId)) return next();

    // Validate id format early
    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee_id' });
    }

    try {
      // Only need restaurant_id field
      const employee = await EmployeeModel.findById(employeeId).select('restaurant_id').lean();
      if (!employee) return res.status(404).json({ message: 'Employee not found' });

      // Owner may access only employees of their restaurant
      if (currentRole === 'owner') {
        if (!req.user.restaurant_id) {
          return res.status(403).json({ message: 'Access denied: owner has no restaurant_id in token' });
        }
        if (String(req.user.restaurant_id) === String(employee.restaurant_id)) return next();
        return res.status(403).json({ message: 'Access denied: employee does not belong to your restaurant' });
      }

      // Staff / customer / others (not allowed)
      return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
      Logging.error('requireEmployeeOwnerOrSelfOrAdmin error:', err);
      return res.status(500).json({ message: 'Server error while checking access' });
    }
  };
};

// Convenience shorthands
export const isAdmin = [authenticate, requireRole('admin')];
export const isOwner = [authenticate, requireRole('owner')];
export const isStaff = [authenticate, requireRole('staff')];
export const isCustomer = [authenticate, requireRole('customer')];
