import { Schema, model, Types } from 'mongoose';

// 1️⃣ Interface
export interface IBadge {
    _id?: Types.ObjectId;
    title: string;
    description: string;
    type: string;
    deletedAt?: Date | null;
}

// Schema
const badgeSchema = new Schema<IBadge>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true });

// Model
export const BadgeModel = model<IBadge>('Badge', badgeSchema);
