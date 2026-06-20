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
const pointsWallet_1 = __importDefault(require("../services/pointsWallet"));
const pagination_1 = require("../utils/pagination");
const createPointsWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedWallet = yield pointsWallet_1.default.createPointsWallet(req.body);
        return res.status(201).json(savedWallet);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readPointsWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    try {
        const wallet = yield pointsWallet_1.default.getPointsWallet(walletId);
        return wallet ? res.status(200).json(wallet) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const readAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
        const { wallets, total } = yield pointsWallet_1.default.getAllPointsWallets(skip, limit);
        return res.status(200).json({
            data: wallets,
            meta: { total: total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const updatePointsWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    try {
        const updatedWallet = yield pointsWallet_1.default.updatePointsWallet(walletId, req.body);
        return updatedWallet ? res.status(201).json(updatedWallet) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
const deletePointsWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    try {
        const wallet = yield pointsWallet_1.default.deletePointsWallet(walletId);
        return wallet ? res.status(200).json(wallet) : res.status(404).json({ message: 'not found' });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.default = { createPointsWallet, readPointsWallet, readAll, updatePointsWallet, deletePointsWallet };
//# sourceMappingURL=pointsWallet.js.map