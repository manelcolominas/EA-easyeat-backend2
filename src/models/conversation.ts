import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    customer: mongoose.Types.ObjectId;
    restaurant: mongoose.Types.ObjectId;
    lastMessage?: mongoose.Types.ObjectId | null;
    lastMessageAt?: Date | null;
}

const ConversationSchema = new Schema(
    {
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
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

ConversationSchema.index(
    { customer: 1, restaurant: 1 },
    { unique: true }
);

export default mongoose.model<IConversation>('Conversation', ConversationSchema);