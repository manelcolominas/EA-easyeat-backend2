import { Schema, model, Types } from 'mongoose';



// Interface
export interface IReport {
    _id?: Types.ObjectId;
   restaurantId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    reason: string;
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
       minlength: 3,
        maxlength: 500
    }
}, { 
    timestamps: { createdAt: 'createdAt', updatedAt: false } 
});

// Model
export const ReportModel = model<IReport>('Report', reportSchema);