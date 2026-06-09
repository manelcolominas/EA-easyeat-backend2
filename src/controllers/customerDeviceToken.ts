import { NextFunction, Request, Response } from 'express';
import CustomerDeviceTokenService from '../services/customerDeviceToken';
import { getPaginationOptions } from '../utils/pagination';

/**
 * POST /customerDeviceTokens/register
 * Register (upsert) a device token for the authenticated customer.
 */
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await CustomerDeviceTokenService.registerToken(req.body);
    return res.status(201).json(token);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /customerDeviceTokens/unregister
 * Soft-deactivate a device token.
 */
const unregister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const result = await CustomerDeviceTokenService.unregisterToken(token);
    return result
      ? res.status(200).json({ message: 'Token unregistered' })
      : res.status(404).json({ message: 'Token not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /customerDeviceTokens/:tokenId
 * Get a single token document by its _id.
 */
const readToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await CustomerDeviceTokenService.getToken(req.params.tokenId);
    return token
      ? res.status(200).json(token)
      : res.status(404).json({ message: 'Token not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /customerDeviceTokens/customer/:customer_id
 * List all active tokens for a given customer.
 */
const readByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await CustomerDeviceTokenService.getTokensByCustomer(req.params.customer_id);
    return res.status(200).json(tokens);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /customerDeviceTokens
 * Paginated list of all tokens (admin only).
 */
const readAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { tokens, total } = await CustomerDeviceTokenService.getAllTokens(skip, limit);
    return res.status(200).json({
      data: tokens,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /customerDeviceTokens/:tokenId/ping
 * Update lastSeenAt for a token — call on app foreground/startup.
 */
const ping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const result = await CustomerDeviceTokenService.refreshLastSeen(token);
    return result
      ? res.status(200).json(result)
      : res.status(404).json({ message: 'Token not found or inactive' });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /customerDeviceTokens/:tokenId
 * Permanently remove a token document (admin only).
 */
const hardDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await CustomerDeviceTokenService.hardDeleteToken(req.params.tokenId);
    return deleted
      ? res.status(200).json({ message: 'Token permanently deleted' })
      : res.status(404).json({ message: 'Token not found' });
  } catch (error) {
    return next(error);
  }
};

export default {
  register,
  unregister,
  readToken,
  readByCustomer,
  readAll,
  ping,
  hardDelete
};
