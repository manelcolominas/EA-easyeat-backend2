import { Request, Response } from 'express';
import { CustomerModel } from '../models/customer';
import { googleWalletService } from '../services/googleWallet.service';
import Logging from '../library/logging';

export class WalletController {
  /**
   * Generates and returns a "Save to Google Wallet" URL for the given user.
   */
  public async getGoogleWalletSaveLink(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Find the user to get their data
      const user = await CustomerModel.findById(userId).active();
      
      if (!user) {
        return res.status(404).json({ message: 'User not found or deleted' });
      }

      const saveUrl = await googleWalletService.generateSaveToWalletLink(user);

      return res.status(200).json({ url: saveUrl });
    } catch (error) {
      Logging.error(`Error in getGoogleWalletSaveLink: ${error}`);
      return res.status(500).json({ message: 'Failed to generate Google Wallet link' });
    }
  }
}

export const walletController = new WalletController();
