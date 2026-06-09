import { CustomerDeviceTokenModel, ICustomerDeviceToken } from '../models/customerDeviceToken';

/**
 * Register (upsert) a device token for a customer.
 * If the token already exists it is re-activated and its metadata updated.
 */
const registerToken = async (data: Pick<ICustomerDeviceToken, 'customer_id' | 'token' | 'platform'>) => {
  return await CustomerDeviceTokenModel.findOneAndUpdate(
    { token: data.token },
    {
      $set: {
        customer_id: data.customer_id,
        platform: data.platform,
        active: true,
        deletedAt: null,
        lastSeenAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

/**
 * Soft-deactivate a device token (sets active=false + deletedAt).
 * Returns null when the token is not found.
 */
const unregisterToken = async (token: string) => {
  return await CustomerDeviceTokenModel.findOneAndUpdate({ token, deletedAt: null }, { $set: { active: false, deletedAt: new Date() } }, { new: true });
};

/**
 * Return a single token document by its MongoDB _id.
 */
const getToken = async (tokenId: string) => {
  return await CustomerDeviceTokenModel.findOne({ _id: tokenId, deletedAt: null }).lean();
};

/**
 * Return all active tokens for a given customer.
 */
const getTokensByCustomer = async (customer_id: string) => {
  return await CustomerDeviceTokenModel.find({ customer_id, active: true, deletedAt: null }).lean();
};

/**
 * Paginated list of every active token (admin use).
 */
const getAllTokens = async (skip: number, limit: number): Promise<{ tokens: ICustomerDeviceToken[]; total: number }> => {
  const [tokens, total] = await Promise.all([CustomerDeviceTokenModel.find({ deletedAt: null }).lean().skip(skip).limit(limit), CustomerDeviceTokenModel.countDocuments({ deletedAt: null })]);
  return { tokens, total };
};

/**
 * Update lastSeenAt to now — call this whenever the token is used
 * to confirm the device is still active.
 */
const refreshLastSeen = async (token: string) => {
  return await CustomerDeviceTokenModel.findOneAndUpdate({ token, active: true, deletedAt: null }, { $set: { lastSeenAt: new Date() } }, { new: true });
};

/**
 * Hard-delete a token document permanently (admin / cleanup use).
 */
const hardDeleteToken = async (tokenId: string) => {
  return await CustomerDeviceTokenModel.findByIdAndDelete(tokenId);
};

export default {
  registerToken,
  unregisterToken,
  getToken,
  getTokensByCustomer,
  getAllTokens,
  refreshLastSeen,
  hardDeleteToken
};
