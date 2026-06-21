import { Schema, model, Types, Model, QueryWithHelpers, HydratedDocument } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// ─── URL validator (used by profilePictures) ──────────────────────────────────

const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

// ─── Password validator ───────────────────────────────────────────────────────
// ≥ 8 chars · at least one uppercase · at least one digit

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ICustomer {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  refreshTokenHash?: string;
  isActive?: boolean;
  deletedAt?: Date | null; // null = alive, Date = soft-deleted
  profilePictures?: string[];
  pointsWallet?: Types.ObjectId[];
  visitHistory?: Types.ObjectId[];
  favoriteRestaurants?: Types.ObjectId[];
  badges?: Types.ObjectId[];
  reviews?: Types.ObjectId[];
}

export interface ICustomerMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * TResult stays generic so `.active()` works correctly on both
 * `.find()` (returns array) and `.findOne()` (returns single doc).
 */
export interface ICustomerQueryHelpers {
  active<TResult>(this: QueryWithHelpers<TResult, HydratedDocument<ICustomer>, ICustomerQueryHelpers>): QueryWithHelpers<TResult, HydratedDocument<ICustomer>, ICustomerQueryHelpers>;
}

type CustomerModelType = Model<ICustomer, ICustomerQueryHelpers, ICustomerMethods>;

// ─── Schema ───────────────────────────────────────────────────────────────────

const customerSchema = new Schema<ICustomer, CustomerModelType, ICustomerMethods, ICustomerQueryHelpers>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [2, 'Name must be at least 2 characters'], maxlength: [100, 'Name cannot exceed 100 characters'] },

    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, match: [/.+@.+\..+/, 'Please provide a valid email address'] },

    password: {
      type: String,
      select: false, // never returned in queries by default
      validate: {
        validator: (v: string) => PASSWORD_REGEX.test(v),
        message: 'Password must be at least 8 characters and contain at least one uppercase letter and one number'
      }
    },

    refreshTokenHash: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    // Soft-delete marker. null = alive. Indexed for fast list filtering.
    deletedAt: { type: Date, default: null, index: true },
    profilePictures: {
      type: [String],
      validate: {
        validator: (urls: string[]) => urls.every((u) => URL_REGEX.test(u)),
        message: 'Every profile picture must be a valid URL'
      }
    },
    pointsWallet: [{ type: Schema.Types.ObjectId, ref: 'PointsWallet' }],
    visitHistory: [{ type: Schema.Types.ObjectId, ref: 'Visit' }],
    favoriteRestaurants: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

/**
 * Partial unique index: enforce email uniqueness ONLY for active (non-deleted)
 * documents. This allows a soft-deleted email address to be re-registered.
 *
 * MongoDB evaluates the filter before applying the uniqueness constraint, so
 * two documents with the same email can coexist as long as at least one of
 * them has deletedAt !== null.
 */
customerSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null }, name: 'email_unique_active' });

// Compound index — useful for "find active customer by email" (login lookup)
customerSchema.index({ email: 1, deletedAt: 1 }, { name: 'email_deletedAt' });

// ─── Query helper: reusable filter for "alive" documents ──────────────────────
// Usage: CustomerModel.find().active()   |   CustomerModel.findOne().active()

customerSchema.query.active = function <TResult>(this: QueryWithHelpers<TResult, HydratedDocument<ICustomer>, ICustomerQueryHelpers>) {
  return this.where({ deletedAt: null });
};

// ─── Pre-save hook: hash password if modified ─────────────────────────────────

customerSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method: verify password ─────────────────────────────────────────

customerSchema.method('comparePassword', async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
});

// ─── Model ────────────────────────────────────────────────────────────────────

export const CustomerModel = model<ICustomer, CustomerModelType>('Customer', customerSchema);
