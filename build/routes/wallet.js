"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("../controllers/wallet.controller");
const router = (0, express_1.Router)();
// GET /wallet/google/save-link/:userId
router.get('/google/save-link/:userId', wallet_controller_1.walletController.getGoogleWalletSaveLink);
exports.default = router;
//# sourceMappingURL=wallet.js.map