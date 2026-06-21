import { GoogleAuth } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import Logging from '../library/logging';
import { config } from '../config/config';
import { ICustomer } from '../models/customer';
import { Types } from 'mongoose';

export class GoogleWalletService {
  private auth: GoogleAuth;
  private classId: string;

  constructor() {
    this.classId = `${config.google.wallet.issuerId}.easyeat_loyalty_card`;

    this.auth = new GoogleAuth({
      keyFile: config.google.wallet.keyFile,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
    });
  }

  /**
   * Creates or updates the LoyaltyClass which serves as the template for the cards.
   * This is typically called once on backend startup.
   */
  public async createOrUpdateLoyaltyClass(): Promise<void> {
    if (!config.google.wallet.issuerId || !config.google.wallet.keyFile) {
      Logging.warning('Google Wallet credentials not fully configured. Skipping LoyaltyClass initialization.');
      return;
    }

    try {
      const client = await this.auth.getClient();
      const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass`;

      // Check if class exists
      try {
        await client.request({
          url: `${url}/${this.classId}`,
          method: 'GET'
        });
        Logging.info(`Google Wallet LoyaltyClass ${this.classId} already exists.`);
        return; // Class already exists, no need to recreate
      } catch (err: any) {
        if (err.response?.status !== 404) {
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

      await client.request({
        url,
        method: 'POST',
        data: newClass
      });

      Logging.info(`Successfully created Google Wallet LoyaltyClass ${this.classId}.`);
    } catch (error: any) {
      const responseInfo = error.response
        ? `status=${error.response.status} statusText=${error.response.statusText} data=${JSON.stringify(error.response.data)}`
        : 'no response data';
      Logging.error(`Error creating LoyaltyClass: ${error} ${responseInfo}`);
    }
  }

  /**
   * Creates or updates a LoyaltyObject for a specific user.
   */
  public async createOrUpdateLoyaltyObject(user: ICustomer): Promise<string> {
    const objectId = `${config.google.wallet.issuerId}.${user._id}`;
    
    try {
      const client = await this.auth.getClient();
      const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject`;

      // Check if object exists
      try {
        await client.request({
          url: `${url}/${objectId}`,
          method: 'GET'
        });
        Logging.info(`Google Wallet LoyaltyObject ${objectId} already exists.`);
        return objectId;
      } catch (err: any) {
        if (err.response?.status !== 404) {
          Logging.error(`Google Wallet GET object failed: status=${err.response?.status} statusText=${err.response?.statusText} data=${JSON.stringify(err.response?.data)}`);
          throw err;
        }
      }

      // Create new object
      const newObject = {
        id: objectId,
        classId: this.classId,
        state: 'ACTIVE',
        accountId: user._id?.toString() || 'unknown',
        accountName: user.name,
        barcode: {
          type: 'QR_CODE',
          value: user._id?.toString() || 'unknown',
          alternateText: user._id?.toString() || 'unknown'
        }
      };

      await client.request({
        url,
        method: 'POST',
        data: newObject
      });

      Logging.info(`Successfully created Google Wallet LoyaltyObject ${objectId}.`);
      return objectId;
    } catch (error: any) {
      const responseInfo = error.response
        ? `status=${error.response.status} statusText=${error.response.statusText} data=${JSON.stringify(error.response.data)}`
        : 'no response data';
      Logging.error(`Error creating LoyaltyObject: ${error} ${responseInfo}`);
      throw error;
    }
  }

  /**
   * Generates the "Save to Google Wallet" JWT link.
   */
  public async generateSaveToWalletLink(user: ICustomer): Promise<string> {
    const objectId = await this.createOrUpdateLoyaltyObject(user);

    // Read credentials from the keyFile to sign the JWT
    const fs = require('fs');
    const path = require('path');
    let keyFilePath = path.resolve(process.cwd(), config.google.wallet.keyFile);

    if (!fs.existsSync(keyFilePath)) {
      const fallbackKeyFile = path.resolve(process.cwd(), 'src', 'config', path.basename(config.google.wallet.keyFile));
      if (fs.existsSync(fallbackKeyFile)) {
        keyFilePath = fallbackKeyFile;
      } else {
        throw new Error(`Google Wallet key file not found at ${keyFilePath} or ${fallbackKeyFile}`);
      }
    }

    const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: config.cors.origins, // restrict where the button can be clicked from
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [
          {
            id: objectId
          }
        ]
      }
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
    
    return `https://pay.google.com/gp/v/save/${token}`;
  }
}

export const googleWalletService = new GoogleWalletService();
