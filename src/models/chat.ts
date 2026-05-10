import mongoose, { Document, Schema } from 'mongoose';

export type SenderRole = 'customer' | 'employee' | 'owner';

export interface IChat extends Document {
    conversation: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    restaurant: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    senderRole: SenderRole;
    contenido: string;
    readBy: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const ChatSchema = new Schema(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Conversation',
        },
        customer: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Customer',
        },
        restaurant: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Restaurant',
        },
        sender: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['customer', 'employee', 'owner'],
            required: true,
        },
        contenido: {
            type: String,
            required: true,
            trim: true,
        },
        readBy: [
            {
                type: Schema.Types.ObjectId,
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

ChatSchema.index({ conversation: 1, createdAt: 1 });
ChatSchema.index({ customer: 1, updatedAt: -1 });
ChatSchema.index({ restaurant: 1, updatedAt: -1 });

export default mongoose.model<IChat>('Chat', ChatSchema);