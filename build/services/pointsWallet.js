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
const mongoose_1 = __importDefault(require("mongoose"));
const pointsWallet_1 = require("../models/pointsWallet");
const customer_1 = require("../models/customer");
const createPointsWallet = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = new pointsWallet_1.PointsWalletModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    const savedWallet = yield wallet.save();
    if (data.customer_id) {
        yield customer_1.CustomerModel.findByIdAndUpdate(data.customer_id, {
            $push: { pointsWallet: savedWallet._id }
        });
    }
    return savedWallet;
});
const getPointsWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pointsWallet_1.PointsWalletModel.findById(walletId);
});
const getAllPointsWallets = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [wallets, total] = yield Promise.all([pointsWallet_1.PointsWalletModel.find().lean().skip(skip).limit(limit), pointsWallet_1.PointsWalletModel.countDocuments()]);
    return { wallets, total };
});
const updatePointsWallet = (walletId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield pointsWallet_1.PointsWalletModel.findById(walletId);
    if (wallet) {
        wallet.set(data);
        return yield wallet.save();
    }
    return null;
});
const deletePointsWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedWallet = yield pointsWallet_1.PointsWalletModel.findByIdAndDelete(walletId);
    if (deletedWallet && deletedWallet.customer_id) {
        yield customer_1.CustomerModel.findByIdAndUpdate(deletedWallet.customer_id, {
            $pull: { pointsWallet: deletedWallet._id }
        });
    }
    return deletedWallet;
});
exports.default = { createPointsWallet, getPointsWallet, getAllPointsWallets, updatePointsWallet, deletePointsWallet };
//# sourceMappingURL=pointsWallet.js.map