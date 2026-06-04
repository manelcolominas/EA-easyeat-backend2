import { Schema, model, Types } from 'mongoose';

export interface ICustomerDeviceToken {
  _id?: Types.ObjectId;
  customer_id: Types.ObjectId;
  token: string;
  platform?: 'android' | 'ios' | 'web';
  active: boolean;
  lastSeenAt?: Date | null;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const customerDeviceTokenSchema = new Schema<ICustomerDeviceToken>(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    platform: { type: String, enum: ['android', 'ios', 'web'], default: 'web' },
    active: { type: Boolean, default: true, index: true },
    lastSeenAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

customerDeviceTokenSchema.index({ customer_id: 1, active: 1, deletedAt: 1 });

export const CustomerDeviceTokenModel = model<ICustomerDeviceToken>('CustomerDeviceToken', customerDeviceTokenSchema);
