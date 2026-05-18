import { Schema, model, Types } from 'mongoose';

// Interface
export interface IStatistics {
  _id?: Types.ObjectId;
  restaurant_id: Types.ObjectId;
  totalPointsGiven?: number;
  loyalCustomers?: number;
  mostRequestedRewards?: Types.ObjectId[];
  averagePointsPerVisit?: number;
}

// Schema
const statisticsSchema = new Schema<IStatistics>(
  {
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, unique: true, index: true },
    totalPointsGiven: { type: Number, default: 0 },
    loyalCustomers: { type: Number, default: 0 },
    mostRequestedRewards: [{ type: Schema.Types.ObjectId, ref: 'Reward' }],
    averagePointsPerVisit: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Model
export const StatisticsModel = model<IStatistics>('Statistics', statisticsSchema);
