import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/config';
import { CustomerModel } from '../models/customer';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract user information
 */
export const verifyGoogleToken = async (idToken: string) => {
  try {
    const ticket = await googleClient.verifyIdToken({
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
  } catch (error) {
    const wrappedError = new Error('Failed to verify Google token') as Error & {
      cause?: unknown;
    };

    wrappedError.cause = error;
    throw wrappedError;
  }
};

/**
 * Find or create customer from Google OAuth data
 */
export const findOrCreateCustomerFromGoogle = async (googleData: { id: string; email: string; name: string; picture?: string }) => {
  try {
    // Try to find existing customer by email
    let customer = await CustomerModel.findOne({
      email: googleData.email,
      deletedAt: null
    });

    if (customer) {
      // Customer exists, return it
      return customer;
    }

    // Customer doesn't exist, create new one
    customer = new CustomerModel({
      name: googleData.name,
      email: googleData.email,
      password: undefined, // Google OAuth users don't have passwords
      profilePictures: googleData.picture ? [googleData.picture] : [],
      isActive: true
    });

    await customer.save();
    return customer;
  } catch (error) {
    const wrappedError = new Error('Failed to find or create customer') as Error & {
      cause?: unknown;
    };

    wrappedError.cause = error;
    throw wrappedError;
  }
};

/**
 * Generate tokens for Google authenticated customer
 */
export const generateGoogleTokens = (customer: any) => {
  const accessToken = generateAccessToken(String(customer._id), customer.name, customer.email, 'customer');

  const refreshToken = generateRefreshToken(String(customer._id), customer.name, customer.email, 'customer');

  return { accessToken, refreshToken };
};
