"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const generateAccessToken = (admin_id, name, email, role, restaurant_id) => {
    const payload = { id: admin_id, name, email, role, type: 'access', restaurant_id };
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.accessSecret, { expiresIn: config_1.config.jwt.accessExpiresIn });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (admin_id, name, email, role, restaurant_id) => {
    const payload = { id: admin_id, name, email, role, type: 'refresh', restaurant_id };
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshExpiresIn });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map