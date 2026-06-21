import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';

const router = Router();

// GET /wallet/google/save-link/:userId
router.get('/google/save-link/:userId', walletController.getGoogleWalletSaveLink);

export default router;
