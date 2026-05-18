import { Schema, model, Types, Model } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IEmployee {
  _id?: Types.ObjectId;
  restaurant_id: Types.ObjectId;
  profile: {
    name: string;
    password?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  refreshTokenHash?: string;
  isActive: boolean;
}

export interface IEmployeeMethods {
  /**
   * Compares a plain-text candidate password against the stored bcrypt hash.
   * Returns true if they match, false otherwise.
   */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type EmployeeModel = Model<IEmployee, {}, IEmployeeMethods>;

// ─── Schema ───────────────────────────────────────────────────────────────────

const employeeSchema = new Schema<IEmployee, EmployeeModel, IEmployeeMethods>(
  {
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    profile: {
      name: { type: String, required: true },
      // select: false keeps the hash out of query results by default
      password: { type: String, select: false },
      email: { type: String },
      phone: { type: String, trim: true },
      role: { type: String, enum: ['owner', 'staff'], default: 'staff' }
    },
    refreshTokenHash: { type: String },
    isActive: { type: Boolean, required: true, default: true }
  },
  { timestamps: true }
);

// ─── Pre-save hook: hash password ─────────────────────────────────────────────

employeeSchema.pre('save', async function () {
  // Password is nested inside profile, so we check 'profile.password'
  if (!this.isModified('profile.password') || !this.profile?.password) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.profile.password = await bcrypt.hash(this.profile.password, salt);
});

// ─── Instance method: verify password ─────────────────────────────────────────

employeeSchema.method('comparePassword', async function (candidatePassword: string): Promise<boolean> {
  // Callers must use .select('+profile.password') when querying for login
  if (!this.profile?.password) return false;
  return bcrypt.compare(candidatePassword, this.profile.password);
});

// ─── Model ────────────────────────────────────────────────────────────────────

export const EmployeeModel = model<IEmployee, EmployeeModel>('Employee', employeeSchema);
