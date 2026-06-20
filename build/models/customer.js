"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
// ─── URL validator (used by profilePictures) ──────────────────────────────────
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
// ─── Password validator ───────────────────────────────────────────────────────
// ≥ 8 chars · at least one uppercase · at least one digit
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
// ─── Schema ───────────────────────────────────────────────────────────────────
const customerSchema = new mongoose_1.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [2, 'Name must be at least 2 characters'], maxlength: [100, 'Name cannot exceed 100 characters'] },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, match: [/.+@.+\..+/, 'Please provide a valid email address'] },
    password: {
        type: String,
        select: false, // never returned in queries by default
        validate: {
            validator: (v) => PASSWORD_REGEX.test(v),
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
            validator: (urls) => urls.every((u) => URL_REGEX.test(u)),
            message: 'Every profile picture must be a valid URL'
        }
    },
    pointsWallet: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'PointsWallet' }],
    visitHistory: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Visit' }],
    favoriteRestaurants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant' }],
    badges: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Badge' }],
    reviews: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Review' }]
}, { timestamps: true });
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
customerSchema.query.active = function () {
    return this.where({ deletedAt: null });
};
// ─── Pre-save hook: hash password if modified ─────────────────────────────────
customerSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password') || !this.password)
            return;
        const salt = yield bcrypt_1.default.genSalt(SALT_ROUNDS);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
    });
});
// ─── Instance method: verify password ─────────────────────────────────────────
customerSchema.method('comparePassword', function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.password)
            return false;
        return bcrypt_1.default.compare(candidatePassword, this.password);
    });
});
// ─── Model ────────────────────────────────────────────────────────────────────
exports.CustomerModel = (0, mongoose_1.model)('Customer', customerSchema);
//# sourceMappingURL=customer.js.map