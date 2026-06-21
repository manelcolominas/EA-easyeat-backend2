'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.isCustomer =
  exports.isStaff =
  exports.isOwner =
  exports.isAdmin =
  exports.requireEmployeeOwnerOrSelfOrAdmin =
  exports.requireRestaurantAccess =
  exports.requireCustomerAccess =
  exports.requireSelfOrAdmin =
  exports.requireRole =
  exports.authenticate =
    void 0;
const jwt_1 = require('../utils/jwt');
const employee_1 = require('../models/employee');
const mongoose_1 = __importDefault(require('mongoose'));
const customer_1 = require('../models/customer');
const logging_1 = __importDefault(require('../library/logging'));
const normalizeRole = (role) => (typeof role === 'string' ? role.trim().toLowerCase() : '');
/**
 * Verifies the Bearer access token and attaches the decoded payload to `req.user`.
 */
const authenticate = (req, res, next) => {
  var _a;
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : undefined;
    const cookieToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    const token = bearerToken || cookieToken;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (decoded.type !== 'access') {
      logging_1.default.error('AUTH REJECTED: invalid token type', decoded.type);
      return res.status(401).json({ message: 'Invalid token type' });
    }
    if (
      !(decoded === null || decoded === void 0 ? void 0 : decoded.id) ||
      !(decoded === null || decoded === void 0 ? void 0 : decoded.email) ||
      !(decoded === null || decoded === void 0 ? void 0 : decoded.role)
    ) {
      logging_1.default.error('AUTH REJECTED: invalid token payload', decoded);
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    decoded.role = normalizeRole(decoded.role);
    req.user = decoded;
    next();
  } catch (error) {
    logging_1.default.error('AUTH VERIFY FAILED', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
exports.authenticate = authenticate;
/**
 * RBAC middleware: check if user has one of the allowed roles.
 * Admins ALWAYS have access (Bypass).
 */
const requireRole = (...roles) => {
  const normalizedAllowedRoles = roles.map(normalizeRole).filter(Boolean);
  return (req, res, next) => {
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
exports.requireRole = requireRole;
/**
 * Ownership middleware: allows access if the user is an admin OR if the
 * requested resource ID matches the authenticated user's ID.
 * Expected parameter name in req.params: 'userId' or 'customer_id'
 */
const requireSelfOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
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
exports.requireSelfOrAdmin = requireSelfOrAdmin;
/**
 * Access middleware: allows access if the user is an admin OR if the
 * requested resource ID matches the authenticated user's ID.
 * OR if the user is owner/staff of the restaurant the customer belongs to.
 */
const requireCustomerAccess = (paramName = 'customer_id') => {
  return (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
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
          const customer = yield customer_1.CustomerModel.findById(customerId).select('favoriteRestaurants').lean();
          if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
          }
          const restaurantId = String(req.user.restaurant_id);
          const belongsToRestaurant = (_a = customer.favoriteRestaurants) === null || _a === void 0 ? void 0 : _a.some((id) => String(id) === restaurantId);
          if (belongsToRestaurant) {
            return next();
          }
        } catch (error) {
          logging_1.default.error('Error in requireCustomerAccess:', error);
          return res.status(500).json({ message: 'Internal server error during authorization' });
        }
      }
      return res.status(403).json({ message: 'Access denied: You do not have permission to access this customer data' });
    });
};
exports.requireCustomerAccess = requireCustomerAccess;
/**
 * Multi-tenant middleware: ensures the user belongs to the restaurant they are trying to access.
 * Admins ALWAYS have access.
 * Owners and Staff must match the restaurant_id.
 */
const requireRestaurantAccess = (paramName = 'restaurant_id') => {
  return (req, res, next) => {
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
exports.requireRestaurantAccess = requireRestaurantAccess;
/**
 * Allows access if:
 *  - admin (bypass)
 *  - owner and the requested employee belongs to the same restaurant as req.user.restaurant_id
 *  - the employee themself (req.user.id === employee_id)
 *
 * Usage: requireEmployeeOwnerOrSelfOrAdmin('employee_id')
 */
const requireEmployeeOwnerOrSelfOrAdmin = (paramName = 'employee_id') => {
  return (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      const currentRole = normalizeRole(req.user.role);
      // Admin bypass
      if (currentRole === 'admin') return next();
      const employeeId = req.params[paramName];
      if (!employeeId) return res.status(400).json({ message: 'Missing employee id' });
      // Self check
      if (String(req.user.id) === String(employeeId)) return next();
      // Validate id format early
      if (!mongoose_1.default.isValidObjectId(employeeId)) {
        return res.status(400).json({ message: 'Invalid employee_id' });
      }
      try {
        // Only need restaurant_id field
        const employee = yield employee_1.EmployeeModel.findById(employeeId).select('restaurant_id').lean();
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
        logging_1.default.error('requireEmployeeOwnerOrSelfOrAdmin error:', err);
        return res.status(500).json({ message: 'Server error while checking access' });
      }
    });
};
exports.requireEmployeeOwnerOrSelfOrAdmin = requireEmployeeOwnerOrSelfOrAdmin;
// Convenience shorthands
exports.isAdmin = [exports.authenticate, (0, exports.requireRole)('admin')];
exports.isOwner = [exports.authenticate, (0, exports.requireRole)('owner')];
exports.isStaff = [exports.authenticate, (0, exports.requireRole)('staff')];
exports.isCustomer = [exports.authenticate, (0, exports.requireRole)('customer')];
//# sourceMappingURL=auth.js.map
