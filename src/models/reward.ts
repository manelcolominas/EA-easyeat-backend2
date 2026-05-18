import { Schema, model, Types } from 'mongoose';

// 1️⃣ Interface
export interface IReward {
  _id?: Types.ObjectId;
  restaurant_id: Types.ObjectId; // reference to Restaurant
  name: string;
  description: string;
  pointsRequired?: number;
  active: boolean;
  expiry?: Date;
  timesRedeemed?: number;
}

// 2️⃣ Schema
const rewardSchema = new Schema<IReward>(
  {
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number },
    active: { type: Boolean, default: true, required: true },
    expiry: { type: Date },
    timesRedeemed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 3️⃣ Model
export const RewardModel = model<IReward>('Reward', rewardSchema);
