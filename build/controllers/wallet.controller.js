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
exports.walletController = exports.WalletController = void 0;
const customer_1 = require("../models/customer");
const googleWallet_service_1 = require("../services/googleWallet.service");
const logging_1 = __importDefault(require("../library/logging"));
class WalletController {
    /**
     * Generates and returns a "Save to Google Wallet" URL for the given user.
     */
    getGoogleWalletSaveLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                if (!userId) {
                    return res.status(400).json({ message: 'User ID is required' });
                }
                // Find the user to get their data
                const user = yield customer_1.CustomerModel.findById(userId).active();
                if (!user) {
                    return res.status(404).json({ message: 'User not found or deleted' });
                }
                const saveUrl = yield googleWallet_service_1.googleWalletService.generateSaveToWalletLink(user);
                return res.status(200).json({ url: saveUrl });
            }
            catch (error) {
                logging_1.default.error(`Error in getGoogleWalletSaveLink: ${error}`);
                return res.status(500).json({ message: 'Failed to generate Google Wallet link' });
            }
        });
    }
}
exports.WalletController = WalletController;
exports.walletController = new WalletController();
//# sourceMappingURL=wallet.controller.js.map