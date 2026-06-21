'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.EmployeeModel = void 0;
const mongoose_1 = require('mongoose');
const bcrypt_1 = __importDefault(require('bcrypt'));
const SALT_ROUNDS = 10;
// ─── Schema ───────────────────────────────────────────────────────────────────
const employeeSchema = new mongoose_1.Schema(
  {
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
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
employeeSchema.pre('save', function () {
  return __awaiter(this, void 0, void 0, function* () {
    var _a;
    // Password is nested inside profile, so we check 'profile.password'
    if (!this.isModified('profile.password') || !((_a = this.profile) === null || _a === void 0 ? void 0 : _a.password)) return;
    const salt = yield bcrypt_1.default.genSalt(SALT_ROUNDS);
    this.profile.password = yield bcrypt_1.default.hash(this.profile.password, salt);
  });
});
// ─── Instance method: verify password ─────────────────────────────────────────
employeeSchema.method('comparePassword', function (candidatePassword) {
  return __awaiter(this, void 0, void 0, function* () {
    var _a;
    // Callers must use .select('+profile.password') when querying for login
    if (!((_a = this.profile) === null || _a === void 0 ? void 0 : _a.password)) return false;
    return bcrypt_1.default.compare(candidatePassword, this.profile.password);
  });
});
// ─── Model ────────────────────────────────────────────────────────────────────
exports.EmployeeModel = (0, mongoose_1.model)('Employee', employeeSchema);
//# sourceMappingURL=employee.js.map
