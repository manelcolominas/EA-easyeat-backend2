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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleWalletService = exports.GoogleWalletService = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logging_1 = __importDefault(require("../library/logging"));
const config_1 = require("../config/config");
class GoogleWalletService {
    constructor() {
        this.classId = `${config_1.config.google.wallet.issuerId}.easyeat_loyalty_card`;
        this.auth = new google_auth_library_1.GoogleAuth({
            keyFile: config_1.config.google.wallet.keyFile,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
        });
    }
    /**
     * Creates or updates the LoyaltyClass which serves as the template for the cards.
     * This is typically called once on backend startup.
     */
    createOrUpdateLoyaltyClass() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!config_1.config.google.wallet.issuerId || !config_1.config.google.wallet.keyFile) {
                logging_1.default.warning('Google Wallet credentials not fully configured. Skipping LoyaltyClass initialization.');
                return;
            }
            try {
                const client = yield this.auth.getClient();
                const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass`;
                // Check if class exists
                try {
                    yield client.request({
                        url: `${url}/${this.classId}`,
                        method: 'GET'
                    });
                    logging_1.default.info(`Google Wallet LoyaltyClass ${this.classId} already exists.`);
                    return; // Class already exists, no need to recreate
                }
                catch (err) {
                    if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) !== 404) {
                        throw err;
                    }
                }
                // Create new class
                const newClass = {
                    id: this.classId,
                    issuerName: 'EasyEat Restaurant',
                    reviewStatus: 'UNDER_REVIEW', // Need to submit for approval in console for production
                    programName: 'EasyEat Loyalty Program',
                    programLogo: {
                        sourceUri: {
                            uri: 'https://i.imgur.com/3qC5xM4.png' // Placeholder logo URL
                        },
                        contentDescription: {
                            defaultValue: {
                                language: 'en',
                                value: 'EasyEat Logo'
                            }
                        }
                    },
                    hexBackgroundColor: '#ff5a5f',
                    localizedIssuerName: {
                        defaultValue: {
                            language: 'es',
                            value: 'Restaurante EasyEat'
                        }
                    }
                };
                yield client.request({
                    url,
                    method: 'POST',
                    data: newClass
                });
                logging_1.default.info(`Successfully created Google Wallet LoyaltyClass ${this.classId}.`);
            }
            catch (error) {
                const responseInfo = error.response
                    ? `status=${error.response.status} statusText=${error.response.statusText} data=${JSON.stringify(error.response.data)}`
                    : 'no response data';
                logging_1.default.error(`Error creating LoyaltyClass: ${error} ${responseInfo}`);
            }
        });
    }
    /**
     * Creates or updates a LoyaltyObject for a specific user.
     */
    createOrUpdateLoyaltyObject(user) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const objectId = `${config_1.config.google.wallet.issuerId}.${user._id}`;
            try {
                const client = yield this.auth.getClient();
                const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject`;
                // Check if object exists
                try {
                    yield client.request({
                        url: `${url}/${objectId}`,
                        method: 'GET'
                    });
                    logging_1.default.info(`Google Wallet LoyaltyObject ${objectId} already exists.`);
                    return objectId;
                }
                catch (err) {
                    if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) !== 404) {
                        logging_1.default.error(`Google Wallet GET object failed: status=${(_b = err.response) === null || _b === void 0 ? void 0 : _b.status} statusText=${(_c = err.response) === null || _c === void 0 ? void 0 : _c.statusText} data=${JSON.stringify((_d = err.response) === null || _d === void 0 ? void 0 : _d.data)}`);
                        throw err;
                    }
                }
                // Create new object
                const newObject = {
                    id: objectId,
                    classId: this.classId,
                    state: 'ACTIVE',
                    accountId: ((_e = user._id) === null || _e === void 0 ? void 0 : _e.toString()) || 'unknown',
                    accountName: user.name,
                    barcode: {
                        type: 'QR_CODE',
                        value: ((_f = user._id) === null || _f === void 0 ? void 0 : _f.toString()) || 'unknown',
                        alternateText: ((_g = user._id) === null || _g === void 0 ? void 0 : _g.toString()) || 'unknown'
                    }
                };
                yield client.request({
                    url,
                    method: 'POST',
                    data: newObject
                });
                logging_1.default.info(`Successfully created Google Wallet LoyaltyObject ${objectId}.`);
                return objectId;
            }
            catch (error) {
                const responseInfo = error.response
                    ? `status=${error.response.status} statusText=${error.response.statusText} data=${JSON.stringify(error.response.data)}`
                    : 'no response data';
                logging_1.default.error(`Error creating LoyaltyObject: ${error} ${responseInfo}`);
                throw error;
            }
        });
    }
    /**
     * Generates the "Save to Google Wallet" JWT link.
     */
    generateSaveToWalletLink(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectId = yield this.createOrUpdateLoyaltyObject(user);
            // Read credentials from the keyFile to sign the JWT
            const fs = require('fs');
            const path = require('path');
            let keyFilePath = path.resolve(process.cwd(), config_1.config.google.wallet.keyFile);
            if (!fs.existsSync(keyFilePath)) {
                const fallbackKeyFile = path.resolve(process.cwd(), 'src', 'config', path.basename(config_1.config.google.wallet.keyFile));
                if (fs.existsSync(fallbackKeyFile)) {
                    keyFilePath = fallbackKeyFile;
                }
                else {
                    throw new Error(`Google Wallet key file not found at ${keyFilePath} or ${fallbackKeyFile}`);
                }
            }
            const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
            const claims = {
                iss: credentials.client_email,
                aud: 'google',
                origins: config_1.config.cors.origins, // restrict where the button can be clicked from
                typ: 'savetowallet',
                payload: {
                    loyaltyObjects: [
                        {
                            id: objectId
                        }
                    ]
                }
            };
            const token = jsonwebtoken_1.default.sign(claims, credentials.private_key, { algorithm: 'RS256' });
            return `https://pay.google.com/gp/v/save/${token}`;
        });
    }
}
exports.GoogleWalletService = GoogleWalletService;
exports.googleWalletService = new GoogleWalletService();
//# sourceMappingURL=googleWallet.service.js.map