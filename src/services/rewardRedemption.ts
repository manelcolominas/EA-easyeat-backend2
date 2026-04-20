import mongoose from 'mongoose';
import { RewardRedemptionModel, IRewardRedemption } from '../models/rewardRedemption';
import { CustomerModel } from '../models/customer';
import { RewardModel } from '../models/reward';
import { PointsWalletModel } from '../models/pointsWallet';

type RedeemRewardPayload = {
  customer_id: string;
  reward_id: string;
  employee_id: string;
  notes?: string;
};

type UpdateStatusPayload = {
  status: 'pending' | 'approved' | 'redeemed' | 'cancelled' | 'expired';
  employee_id?: string;
  notes?: string;
};

const buildError = (status: number, message: string) => {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
};

const getRewardCost = (reward: any): number => {
  const value = Number(reward?.pointsRequired);

  if (!Number.isFinite(value) || value <= 0) {
    throw buildError(500, 'Reward pointsRequired is not configured correctly');
  }

  return value;
};

const getRewardExpiry = (reward: any): Date | null => {
  const raw = reward?.expiry ?? null;
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const createRewardRedemption = async (data: Partial<IRewardRedemption>) => {
  const redemption = new RewardRedemptionModel({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });

  return await redemption.save();
};


const redeemReward = async (data: RedeemRewardPayload) => {
  const session = await mongoose.startSession();

  try {
    let response: any = null;

    try {
      await session.withTransaction(async () => {
        const { customer_id, reward_id, employee_id, notes } = data;

        if (!mongoose.Types.ObjectId.isValid(customer_id)) {
          throw buildError(400, 'Invalid customer_id');
        }

        if (!mongoose.Types.ObjectId.isValid(reward_id)) {
          throw buildError(400, 'Invalid reward_id');
        }

        if (!mongoose.Types.ObjectId.isValid(employee_id)) {
          throw buildError(400, 'Invalid employee_id');
        }

        const customer = await CustomerModel.findOne({
          _id: new mongoose.Types.ObjectId(customer_id),
          deletedAt: null
        }).session(session);

        if (!customer) {
          throw buildError(404, 'Customer not found');
        }

        const reward = await RewardModel.findById(reward_id).session(session);

        if (!reward) {
          throw buildError(404, 'Reward not found');
        }

        if (reward.active === false) {
          throw buildError(400, 'Reward is not active');
        }

        const expiry = getRewardExpiry(reward);
        if (expiry && expiry.getTime() < Date.now()) {
          throw buildError(400, 'Reward has expired');
        }

        const restaurantId = String(reward.restaurant_id);

        if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
          throw buildError(500, 'Reward restaurant is not configured correctly');
        }

        const wallet = await PointsWalletModel.findOne({
          customer_id: new mongoose.Types.ObjectId(customer_id),
          restaurant_id: new mongoose.Types.ObjectId(restaurantId)
        }).session(session);

        if (!wallet) {
          throw buildError(404, 'Points wallet for this restaurant was not found');
        }

        const pointsUsed = getRewardCost(reward);

        if (wallet.points < pointsUsed) {
          throw buildError(400, 'Not enough points');
        }

        const pointsBefore = wallet.points;

        wallet.points = wallet.points - pointsUsed;
        await wallet.save({ session });

        const [redemption] = await RewardRedemptionModel.create([{
          customer_id: customer._id,
          restaurant_id: new mongoose.Types.ObjectId(restaurantId),
          reward_id: reward._id,
          employee_id: new mongoose.Types.ObjectId(employee_id),
          pointsUsed,
          status: 'redeemed',
          redeemedAt: new Date(),
          notes: notes?.trim() || ''
        }], { session });

        reward.timesRedeemed = Number(reward.timesRedeemed ?? 0) + 1;
        await reward.save({ session });

        response = {
          message: 'Reward redeemed successfully',
          redemption,
          wallet,
          pointsBefore,
          pointsAfter: wallet.points
        };
      });

      return response;
    } catch (error: any) {
      if (isTransactionUnsupportedError(error)) {
        return await redeemRewardWithoutTransaction(data);
      }
      throw error;
    }
  } finally {
    await session.endSession();
  }
};

const getRewardRedemption = async (redemptionId: string) => {
  return await RewardRedemptionModel.findById(redemptionId)
      .populate('customer_id', 'name email')
      .populate('reward_id', 'name description pointsRequired')
      .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
      .populate('employee_id', 'name');
};

const getAllRewardRedemptions = async ( skip: number, limit: number ): Promise<{ redemptions: IRewardRedemption[], total: number }> => {
  const [redemptions, total] = await Promise.all([
    RewardRedemptionModel.find()
        .populate('customer_id', 'name email')
        .populate('reward_id', 'name description pointsRequired')
        .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
        .populate('employee_id', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IRewardRedemption[]>(),
    RewardRedemptionModel.countDocuments()
  ]);

  return { redemptions, total };
};

const getByCustomer = async (customer_id: string, skip: number, limit: number) => {
    const [redemptions, total] = await Promise.all([
        RewardRedemptionModel.find({ customer_id })
            .populate('reward_id', 'name description pointsRequired')
            .populate('restaurant_id', 'profile.name profile.location.city profile.location.address')
            .populate('employee_id', 'name')
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IRewardRedemption[]>(),
        RewardRedemptionModel.countDocuments({ customer_id })
    ]);
    return { redemptions, total };
};

const getByRestaurant = async (restaurant_id: string, skip: number, limit: number) => {
    const [redemptions, total] = await Promise.all([
        RewardRedemptionModel.find({ restaurant_id })
            .populate('customer_id', 'name email')
            .populate('reward_id', 'name description pointsRequired')
            .populate('employee_id', 'name email')
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IRewardRedemption[]>(),
        RewardRedemptionModel.countDocuments({ restaurant_id })
    ]);
    return { redemptions, total };
};

const getByEmployee = async (employee_id: string, skip: number, limit: number) => {
    const [redemptions, total] = await Promise.all([
        RewardRedemptionModel.find({ employee_id })
            .populate('customer_id', 'name')
            .populate('reward_id', 'name')
            .populate('restaurant_id', 'profile.name')
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IRewardRedemption[]>(),
        RewardRedemptionModel.countDocuments({ employee_id })
    ]);
    return { redemptions, total };
};

const getByReward = async (reward_id: string, skip: number, limit: number) => {
    const [redemptions, total] = await Promise.all([
        RewardRedemptionModel.find({ reward_id })
            .populate('customer_id', 'name email')
            .populate('restaurant_id', 'profile.name')
            .populate('employee_id', 'name')
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IRewardRedemption[]>(),
        RewardRedemptionModel.countDocuments({ reward_id })
    ]);
    return { redemptions, total };
};

const updateRewardRedemption = async (redemptionId: string, data: Partial<IRewardRedemption>) => {
  const redemption = await RewardRedemptionModel.findById(redemptionId);

  if (!redemption) return null;

  redemption.set(data);
  return await redemption.save();
};

const updateStatus = async (redemptionId: string, data: UpdateStatusPayload) => {
  const redemption = await RewardRedemptionModel.findById(redemptionId);

  if (!redemption) return null;

  redemption.status = data.status;

  if (data.employee_id) {
    redemption.employee_id = new mongoose.Types.ObjectId(data.employee_id) as any;
  }

  if (typeof data.notes === 'string') {
    redemption.notes = data.notes;
  }

  if (data.status === 'redeemed') {
    redemption.redeemedAt = new Date();
  }

  return await redemption.save();
};

const deleteRewardRedemption = async (redemptionId: string) => {
  return await RewardRedemptionModel.findByIdAndDelete(redemptionId);
};

const isTransactionUnsupportedError = (error: any): boolean => {
  const message = String(error?.message || '');
  return message.includes('Transaction numbers are only allowed on a replica set member or mongos');
};

const redeemRewardWithoutTransaction = async (data: RedeemRewardPayload) => {
  const { customer_id, reward_id, employee_id, notes } = data;

  if (!mongoose.Types.ObjectId.isValid(customer_id)) {
    throw buildError(400, 'Invalid customer_id');
  }

  if (!mongoose.Types.ObjectId.isValid(reward_id)) {
    throw buildError(400, 'Invalid reward_id');
  }

  if (!mongoose.Types.ObjectId.isValid(employee_id)) {
    throw buildError(400, 'Invalid employee_id');
  }

  const customer = await CustomerModel.findOne({
    _id: new mongoose.Types.ObjectId(customer_id),
    deletedAt: null
  });

  if (!customer) {
    throw buildError(404, 'Customer not found');
  }

  const reward = await RewardModel.findById(reward_id);

  if (!reward) {
    throw buildError(404, 'Reward not found');
  }

  if (reward.active === false) {
    throw buildError(400, 'Reward is not active');
  }

  const expiry = getRewardExpiry(reward);
  if (expiry && expiry.getTime() < Date.now()) {
    throw buildError(400, 'Reward has expired');
  }

  const restaurantId = String(reward.restaurant_id);

  if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw buildError(500, 'Reward restaurant is not configured correctly');
  }

  const wallet = await PointsWalletModel.findOne({
    customer_id: new mongoose.Types.ObjectId(customer_id),
    restaurant_id: new mongoose.Types.ObjectId(restaurantId)
  });

  if (!wallet) {
    throw buildError(404, 'Points wallet for this restaurant was not found');
  }

  const pointsUsed = getRewardCost(reward);

  if (wallet.points < pointsUsed) {
    throw buildError(400, 'Not enough points');
  }

  const pointsBefore = wallet.points;

  // 1) crear redemption temporal en pending
  const redemption = await RewardRedemptionModel.create({
    customer_id: customer._id,
    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
    reward_id: reward._id,
    employee_id: new mongoose.Types.ObjectId(employee_id),
    pointsUsed,
    status: 'pending',
    redeemedAt: null,
    notes: notes?.trim() || ''
  });

  try {
    // 2) descomptar punts
    wallet.points = wallet.points - pointsUsed;
    await wallet.save();

    // 3) incrementar comptador reward
    reward.timesRedeemed = Number(reward.timesRedeemed ?? 0) + 1;
    await reward.save();

    // 4) tancar redemption
    redemption.status = 'redeemed';
    redemption.redeemedAt = new Date() as any;
    await redemption.save();

    return {
      message: 'Reward redeemed successfully (without transaction)',
      redemption,
      wallet,
      pointsBefore,
      pointsAfter: wallet.points
    };
  } catch (error) {
  try {
    wallet.points = pointsBefore;
    await wallet.save();
  } catch {}

  try {
    reward.timesRedeemed = Math.max(0, Number(reward.timesRedeemed ?? 1) - 1);
    await reward.save();
  } catch {}

  try {
    await RewardRedemptionModel.findByIdAndDelete(redemption._id);
  } catch {}

  throw error;
}
};

export default {
  createRewardRedemption,
  redeemReward,
  getRewardRedemption,
  getAllRewardRedemptions,
  getByCustomer,
  getByRestaurant,
  getByEmployee,
  getByReward,
  updateRewardRedemption,
  updateStatus,
  deleteRewardRedemption,
  isTransactionUnsupportedError,
  redeemRewardWithoutTransaction
};