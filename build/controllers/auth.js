'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            }
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
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
exports.registerGoogle = exports.loginGoogle = exports.logout = exports.refresh = exports.registerAdmin = exports.loginAdmin = void 0;
const admin_1 = require('../models/admin');
const auth_1 = require('../services/auth');
const jwt_1 = require('../utils/jwt');
const config_1 = require('../config/config');
const logging_1 = __importDefault(require('../library/logging'));
const googleAuth_1 = require('../services/googleAuth');
const loginAdmin = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
      const { email, password, role = 'admin' } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      if (role === 'customer') {
        const customer = yield (0, auth_1.validateCustomerCredentials)(email, password);
        if (!customer) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const accessToken = (0, jwt_1.generateAccessToken)(String(customer._id), customer.name, customer.email, 'customer');
        const refreshToken = (0, jwt_1.generateRefreshToken)(String(customer._id), customer.name, customer.email, 'customer');
        res.cookie('accessToken', accessToken, Object.assign(Object.assign({}, config_1.config.cookies.options), { httpOnly: true }));
        res.cookie(config_1.config.cookies.refreshName, refreshToken, config_1.config.cookies.options);
        return res.status(200).json({
          message: 'Auth successful',
          accessToken,
          customer: {
            _id: customer._id,
            email: customer.email,
            name: customer.name,
            role: 'customer'
          }
        });
      }
      if (role === 'employee') {
        const employee = yield (0, auth_1.validateEmployeeCredentials)(email, password);
        if (!employee) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const name = employee.profile.name;
        const empEmail = (_a = employee.profile.email) !== null && _a !== void 0 ? _a : email;
        const empRole = (_b = employee.profile.role) !== null && _b !== void 0 ? _b : 'staff';
        const restaurantId = String(employee.restaurant_id); // Get the restaurant_id
        const accessToken = (0, jwt_1.generateAccessToken)(String(employee._id), name, empEmail, empRole, restaurantId);
        const refreshToken = (0, jwt_1.generateRefreshToken)(String(employee._id), name, empEmail, empRole, restaurantId);
        res.cookie('accessToken', accessToken, Object.assign(Object.assign({}, config_1.config.cookies.options), { httpOnly: true }));
        res.cookie(config_1.config.cookies.refreshName, refreshToken, config_1.config.cookies.options);
        return res.status(200).json({
          message: 'Auth successful',
          accessToken,
          employee: {
            _id: employee._id,
            name: employee.profile.name,
            email: employee.profile.email,
            role: employee.profile.role,
            restaurant_id: employee.restaurant_id
          }
        });
      }
      // Default: admin login
      const admin = yield (0, auth_1.validateAdminCredentials)(email, password);
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const { accessToken, refreshToken } = (0, auth_1.getTokens)(admin);
      res.cookie('accessToken', accessToken, Object.assign(Object.assign({}, config_1.config.cookies.options), { httpOnly: true }));
      res.cookie(config_1.config.cookies.refreshName, refreshToken, config_1.config.cookies.options);
      return res.status(200).json({
        message: 'Auth successful',
        accessToken,
        admin: {
          _id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      logging_1.default.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
exports.loginAdmin = loginAdmin;
const registerAdmin = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, password, and name are required' });
      }
      const existingAdmin = yield admin_1.AdminModel.findOne({ email });
      if (existingAdmin) {
        return res.status(409).json({ message: 'Admin with this email already exists' });
      }
      // Pass plaintext password — the pre-save hook in admin.ts hashes it
      // automatically with bcrypt, identical to the customer and employee models.
      const admin = new admin_1.AdminModel({ email, password, name });
      yield admin.save();
      return res.status(201).json({
        message: 'Admin created successfully',
        admin: {
          _id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      logging_1.default.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
exports.registerAdmin = registerAdmin;
const refresh = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
      const incomingRefreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[config_1.config.cookies.refreshName];
      if (!incomingRefreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }
      const { verifyRefreshToken } = yield Promise.resolve().then(() => __importStar(require('../utils/jwt')));
      const payload = verifyRefreshToken(incomingRefreshToken);
      if (payload.type !== 'refresh') {
        return res.status(401).json({ message: 'Invalid token type' });
      }
      const admin = yield admin_1.AdminModel.findById(payload.id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      // Re-use the same service helper as loginAdmin — no duplicated token logic.
      const { accessToken } = (0, auth_1.getTokens)(admin);
      return res.json({ accessToken });
    } catch (_b) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  });
exports.refresh = refresh;
/**
 * POST /auth/logout
 * Clears the httpOnly refresh cookie, effectively ending the session.
 */
const logout = (_req, res) => {
  res.clearCookie(config_1.config.cookies.refreshName, config_1.config.cookies.options);
  return res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
/**
 * POST /auth/login/google
 * Login or create customer using Google OAuth token
 */
const loginGoogle = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }
      // Verify Google token
      const googleData = yield (0, googleAuth_1.verifyGoogleToken)(idToken);
      // Find or create customer
      const customer = yield (0, googleAuth_1.findOrCreateCustomerFromGoogle)(googleData);
      // Generate tokens
      const { accessToken, refreshToken } = (0, googleAuth_1.generateGoogleTokens)(customer);
      // Set cookies
      res.cookie('accessToken', accessToken, Object.assign(Object.assign({}, config_1.config.cookies.options), { httpOnly: true }));
      res.cookie(config_1.config.cookies.refreshName, refreshToken, config_1.config.cookies.options);
      return res.status(200).json({
        message: 'Google login successful',
        accessToken,
        customer: {
          _id: customer._id,
          email: customer.email,
          name: customer.name,
          role: 'customer',
          profilePicture: ((_a = customer.profilePictures) === null || _a === void 0 ? void 0 : _a[0]) || null
        }
      });
    } catch (error) {
      logging_1.default.error(error);
      return res.status(401).json({ message: 'Google authentication failed' });
    }
  });
exports.loginGoogle = loginGoogle;
/**
 * POST /auth/register/google
 * Register customer using Google OAuth token
 */
const registerGoogle = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }
      // Verify Google token
      const googleData = yield (0, googleAuth_1.verifyGoogleToken)(idToken);
      // Find or create customer
      const customer = yield (0, googleAuth_1.findOrCreateCustomerFromGoogle)(googleData);
      // Generate tokens
      const { accessToken, refreshToken } = (0, googleAuth_1.generateGoogleTokens)(customer);
      // Set cookies
      res.cookie('accessToken', accessToken, Object.assign(Object.assign({}, config_1.config.cookies.options), { httpOnly: true }));
      res.cookie(config_1.config.cookies.refreshName, refreshToken, config_1.config.cookies.options);
      return res.status(201).json({
        message: 'Account registered or retrieved successfully',
        accessToken,
        customer: {
          _id: customer._id,
          email: customer.email,
          name: customer.name,
          role: 'customer',
          profilePicture: ((_a = customer.profilePictures) === null || _a === void 0 ? void 0 : _a[0]) || null
        }
      });
    } catch (error) {
      logging_1.default.error(error);
      return res.status(400).json({ message: 'Google registration failed' });
    }
  });
exports.registerGoogle = registerGoogle;
exports.default = {
  loginAdmin: exports.loginAdmin,
  registerAdmin: exports.registerAdmin,
  refresh: exports.refresh,
  logout: exports.logout,
  loginGoogle: exports.loginGoogle,
  registerGoogle: exports.registerGoogle
};
//# sourceMappingURL=auth.js.map
