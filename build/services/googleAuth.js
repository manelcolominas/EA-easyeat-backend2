"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGoogleTokens = exports.findOrCreateCustomerFromGoogle = exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const customer_1 = require("../models/customer");
const jwt_1 = require("../utils/jwt");
// Initialize Google OAuth2 client
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * Verify Google ID token and extract user information
 */
const verifyGoogleToken = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid token payload');
        }
        return {
            id: payload.sub,
            email: payload.email || '',
            name: payload.name || '',
            picture: payload.picture || ''
        };
    }
    catch (error) {
        throw new Error(`Failed to verify Google token: ${error}`);
    }
});
exports.verifyGoogleToken = verifyGoogleToken;
/**
 * Find or create customer from Google OAuth data
 */
const findOrCreateCustomerFromGoogle = (googleData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try to find existing customer by email
        let customer = yield customer_1.CustomerModel.findOne({
            email: googleData.email,
            deletedAt: null
        });
        if (customer) {
            // Customer exists, return it
            return customer;
        }
        // Customer doesn't exist, create new one
        customer = new customer_1.CustomerModel({
            name: googleData.name,
            email: googleData.email,
            password: undefined, // Google OAuth users don't have passwords
            profilePictures: googleData.picture ? [googleData.picture] : [],
            isActive: true
        });
        yield customer.save();
        return customer;
    }
    catch (error) {
        throw new Error(`Failed to find or create customer: ${error}`);
    }
});
exports.findOrCreateCustomerFromGoogle = findOrCreateCustomerFromGoogle;
/**
 * Generate tokens for Google authenticated customer
 */
const generateGoogleTokens = (customer) => {
    const accessToken = (0, jwt_1.generateAccessToken)(String(customer._id), customer.name, customer.email, 'customer');
    const refreshToken = (0, jwt_1.generateRefreshToken)(String(customer._id), customer.name, customer.email, 'customer');
    return { accessToken, refreshToken };
};
exports.generateGoogleTokens = generateGoogleTokens;
//# sourceMappingURL=googleAuth.js.map