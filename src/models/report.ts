import { Schema, model, Types } from 'mongoose';

export const REPORT_REASONS = [
    'restaurant_inexistent',
    'informacio_incorrecta',
    'restaurant_tancat'
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

// Interface
export interface IReport {
    _id?: Types.ObjectId;
    restaurantId: Types.ObjectId;
    userId: Types.ObjectId;
    reason: ReportReason;
    createdAt?: Date;
}

// Schema
const reportSchema = new Schema<IReport>({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    reason: {
        type: String,
        required: true,
        trim: true,
        enum: REPORT_REASONS
    }
}, { 
    timestamps: { createdAt: 'createdAt', updatedAt: false } 
});

// Model
export const ReportModel = model<IReport>('Report', reportSchema);
