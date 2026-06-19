import { Schema, model, QueryWithHelpers, HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export interface IAdmin {
  _id?: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: string;
}

export interface IAdminMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAdminQueryHelpers {
  active<TResult>(this: QueryWithHelpers<TResult, HydratedDocument<IAdmin>, IAdminQueryHelpers>): QueryWithHelpers<TResult, HydratedDocument<IAdmin>, IAdminQueryHelpers>;
}

const adminSchema = new Schema<IAdmin, mongoose.Model<IAdmin>, IAdminMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // emails must be unique — correct
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      select: false, // never returned by default — correct
      validate: {
        validator: (v: string) => PASSWORD_REGEX.test(v),
        message: 'Password must be at least 8 characters and contain at least one uppercase letter and one number'
      }
    },
    role: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ['admin'],
      default: 'admin'
    }
  },
  { timestamps: true }
);

adminSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.method('comparePassword', async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
});

export const AdminModel = model<IAdmin, mongoose.Model<IAdmin, {}, IAdminMethods>>('Admin', adminSchema);
