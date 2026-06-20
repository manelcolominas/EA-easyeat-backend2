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
exports.AdminModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const adminSchema = new mongoose_1.Schema({
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
            validator: (v) => PASSWORD_REGEX.test(v),
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
}, { timestamps: true });
adminSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password') || !this.password)
            return;
        const salt = yield bcrypt_1.default.genSalt(SALT_ROUNDS);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
    });
});
adminSchema.method('comparePassword', function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.password)
            return false;
        return bcrypt_1.default.compare(candidatePassword, this.password);
    });
});
exports.AdminModel = (0, mongoose_1.model)('Admin', adminSchema);
//# sourceMappingURL=admin.js.map