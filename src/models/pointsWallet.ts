import { Schema, model, Types } from 'mongoose';

export interface IPointsWallet {
  _id?: Types.ObjectId;
  customer_id: Types.ObjectId; // reference to Customer
  restaurant_id: Types.ObjectId; // reference to Restaurant
  points: number;
}

const pointsWalletSchema = new Schema<IPointsWallet>(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    points: { type: Number, required: true, default: 0, min: [0, 'Points cannot be negative'] }
  },
  { timestamps: true }
);

pointsWalletSchema.index({ customer_id: 1, restaurant_id: 1 }, { unique: true });

pointsWalletSchema.index({ customer_id: 1 });

export const PointsWalletModel = model<IPointsWallet>('PointsWallet', pointsWalletSchema);
