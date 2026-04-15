import { Schema, model, Types } from 'mongoose';

export interface IRewardRedemption {
    _id?: Types.ObjectId;
    customer_id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    reward_id: Types.ObjectId;
    employee_id: Types.ObjectId | null;
    pointsUsed: number;
    status: 'pending' | 'approved' | 'redeemed' | 'cancelled' | 'expired';
    redeemedAt?: Date | null;
    notes?: string;
}

const rewardRedemptionSchema = new Schema<IRewardRedemption>({
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    reward_id: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
    employee_id: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    pointsUsed: {
        type: Number,
        required: true,
        min: [0, 'Points used cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'redeemed', 'cancelled', 'expired'],
        default: 'pending'
    },
    redeemedAt: {
        type: Date,
        default: null
    },
    notes: { type: String, trim: true }
}, { timestamps: true });

export const RewardRedemptionModel = model<IRewardRedemption>(
    'RewardRedemption',
    rewardRedemptionSchema
);