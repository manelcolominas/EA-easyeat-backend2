import { Schema, model, Types } from 'mongoose';

export interface ICustomerStats {
  _id?: Types.ObjectId;
  customer_id: Types.ObjectId;
  totalVisits: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentPointsBalance: number;
  totalReviews: number;
  averageReviewRating: number;
  totalBadges: number;
  favoriteRestaurants: number;
}

const customerStatsSchema = new Schema<ICustomerStats>(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    totalVisits: { type: Number, default: 0 },
    totalPointsEarned: { type: Number, default: 0 },
    totalPointsSpent: { type: Number, default: 0 },
    currentPointsBalance: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageReviewRating: { type: Number, default: 0 },
    totalBadges: { type: Number, default: 0 },
    favoriteRestaurants: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const CustomerStatsModel = model<ICustomerStats>('CustomerStats', customerStatsSchema);
