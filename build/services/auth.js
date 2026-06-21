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
Object.defineProperty(exports, '__esModule', { value: true });
exports.refreshadminSession = exports.getTokens = exports.validateEmployeeCredentials = exports.validateCustomerCredentials = exports.validateAdminCredentials = void 0;
const admin_1 = require('../models/admin');
const customer_1 = require('../models/customer');
const employee_1 = require('../models/employee');
const jwt_1 = require('../utils/jwt');
const validateAdminCredentials = (email, password) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield admin_1.AdminModel.findOne({ email }).select('+password');
    if (!admin) return null;
    const isMatch = yield admin.comparePassword(password);
    if (!isMatch) return null;
    return admin;
  });
exports.validateAdminCredentials = validateAdminCredentials;
const validateCustomerCredentials = (email, password) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customer_1.CustomerModel.findOne({ email, deletedAt: null }).select('+password');
    if (!customer) return null;
    const isMatch = yield customer.comparePassword(password);
    if (!isMatch) return null;
    return customer;
  });
exports.validateCustomerCredentials = validateCustomerCredentials;
const validateEmployeeCredentials = (email, password) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const employee = yield employee_1.EmployeeModel.findOne({ 'profile.email': email, isActive: true }).select('+profile.password');
    if (!employee) return null;
    const isMatch = yield employee.comparePassword(password);
    if (!isMatch) return null;
    return employee;
  });
exports.validateEmployeeCredentials = validateEmployeeCredentials;
const getTokens = (admin) => {
  const accessToken = (0, jwt_1.generateAccessToken)(String(admin._id), admin.name, admin.email, admin.role);
  const refreshToken = (0, jwt_1.generateRefreshToken)(String(admin._id), admin.name, admin.email, admin.role);
  return { accessToken, refreshToken };
};
exports.getTokens = getTokens;
const refreshadminSession = (incomingRefreshToken) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const payload = (0, jwt_1.verifyRefreshToken)(incomingRefreshToken);
    if (payload.type !== 'refresh') throw new Error('Invalid token type');
    const admin = yield admin_1.AdminModel.findById(payload.id);
    if (!admin) throw new Error('Admin not found');
    return (0, exports.getTokens)(admin);
  });
exports.refreshadminSession = refreshadminSession;
//# sourceMappingURL=auth.js.map
