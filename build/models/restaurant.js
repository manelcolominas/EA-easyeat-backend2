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
Object.defineProperty(exports, '__esModule', { value: true });
exports.RestaurantModel = exports.RESTAURANT_CATEGORIES = void 0;
const mongoose_1 = require('mongoose');
// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
exports.RESTAURANT_CATEGORIES = [
  'Italià',
  'Japonès',
  'Sushi',
  'Mexicà',
  'Xinès',
  'Indi',
  'Tailandès',
  'Francès',
  'Espanyol',
  'Grec',
  'Turc',
  'Coreà',
  'Vietnamita',
  'Alemany',
  'Brasileny',
  'Peruà',
  'Vegà',
  'Vegetarià',
  'Marisc',
  'Carn',
  'Pizzeria',
  'Cafeteria',
  'Ramen',
  'Gluten Free',
  'Gourmet',
  'Fast Food',
  'Buffet',
  'Food Truck',
  'Lounge',
  'Pub',
  'Wine Bar',
  'Rooftop',
  'Bar',
  'Taperia',
  'Gelateria',
  'Estrella Michelin',
  'Street Food'
];
// ─────────────────────────────────────────────────────────────────────────────
// Regex validators (reused in schema)
// ─────────────────────────────────────────────────────────────────────────────
/** International phone number (allows spaces and hyphens) */
const PHONE_REGEX = /^\+?[1-9][\d\s-]{1,18}$/;
/** Simple RFC-5322-like e-mail check */
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
/** "HH:MM" – 00:00 … 23:59 */
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
// ─────────────────────────────────────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────────────────────────────────────
const timetableSlotSchema = new mongoose_1.Schema(
  {
    open: { type: String, required: true, validate: { validator: (v) => TIME_REGEX.test(v), message: (p) => `"${p.value}" is not a valid HH:MM time.` } },
    close: { type: String, required: true, validate: { validator: (v) => TIME_REGEX.test(v), message: (p) => `"${p.value}" is not a valid HH:MM time.` } }
  },
  { _id: false }
);
const timetableSchema = new mongoose_1.Schema(
  {
    monday: [timetableSlotSchema],
    tuesday: [timetableSlotSchema],
    wednesday: [timetableSlotSchema],
    thursday: [timetableSlotSchema],
    friday: [timetableSlotSchema],
    saturday: [timetableSlotSchema],
    sunday: [timetableSlotSchema]
  },
  { _id: false }
);
const geoPointSchema = new mongoose_1.Schema(
  {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) =>
          v.length === 2 &&
          v[0] >= -180 &&
          v[0] <= 180 && // longitude
          v[1] >= -90 &&
          v[1] <= 90, // latitude
        message: 'coordinates must be [longitude (-180..180), latitude (-90..90)].'
      }
    }
  },
  { _id: false }
);
// ─────────────────────────────────────────────────────────────────────────────
// Root schema
// ─────────────────────────────────────────────────────────────────────────────
const restaurantSchema = new mongoose_1.Schema(
  {
    profile: {
      name: {
        type: String,
        required: [true, 'Restaurant name is required.'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters.'],
        maxlength: [120, 'Name must be at most 120 characters.']
      },
      description: {
        type: String,
        required: [true, 'Description is required.'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters.'],
        maxlength: [2000, 'Description must be at most 2000 characters.']
      },
      globalRating: { type: Number, default: 0, min: [0, 'globalRating cannot be below 0.'], max: [10, 'globalRating cannot exceed 10.'] },
      maxPointsVisit: { type: Number, default: 0, min: [0, 'maxPoints cannot be below 0.'] },
      category: {
        type: [{ type: String, enum: exports.RESTAURANT_CATEGORIES }],
        required: [true, 'At least one category is required.'],
        validate: { validator: (v) => v.length >= 1, message: 'category must contain at least one value.' }
      },
      timetable: { type: timetableSchema, required: false },
      image: [{ type: String }],
      contact: {
        phone: {
          type: String,
          trim: true,
          validate: {
            validator: (v) => PHONE_REGEX.test(v),
            message: (p) => `"${p.value}" is not a valid phone number.`
          }
        },
        email: {
          type: String,
          trim: true,
          lowercase: true,
          validate: {
            validator: (v) => EMAIL_REGEX.test(v),
            message: (p) => `"${p.value}" is not a valid e-mail address.`
          }
        },
        website: { type: String, trim: true }
      },
      location: {
        city: { type: String, required: [true, 'City is required.'], trim: true },
        address: { type: String, trim: true, required: false },
        googlePlaceId: { type: String, required: false },
        coordinates: { type: geoPointSchema, required: [true, 'GeoJSON coordinates are required.'] }
      },
      pointsSystem: {
        method: { type: String, enum: ['simple', 'exponential'], default: 'exponential' },
        pointsPerEuro: { type: Number, default: 10 },
        maxPointsVisit: { type: Number, default: 500 }
      }
    },
    owner_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee' },
    employees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee' }],
    dishes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Dish' }],
    rewards: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Reward' }],
    statistics: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Statistics' },
    badges: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Badge' }],
    visits: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Visit' }],
    reviews: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Review' }],
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true, // adds createdAt / updatedAt
    versionKey: false // removes __v
  }
);
// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────
// 1. GeoJSON 2dsphere – required for $geoNear / $near queries
restaurantSchema.index({ 'profile.location.coordinates': '2dsphere' });
// 2. Unique name per city (case-insensitive enforced at app layer via trim/lowercase)
restaurantSchema.index({ 'profile.name': 1, 'profile.location.city': 1 }, { unique: true, name: 'unique_name_per_city' });
// Text index for multi-field search
restaurantSchema.index(
  {
    'profile.name': 'text',
    'profile.category': 'text',
    'profile.location.city': 'text',
    'profile.location.address': 'text'
  },
  {
    weights: {
      'profile.name': 10,
      'profile.category': 5,
      'profile.location.city': 3,
      'profile.location.address': 1
    },
    name: 'restaurant_text_search_idx'
  }
);
// 3. Performance – common query fields
restaurantSchema.index({ 'profile.globalRating': -1 }); // sort by globalRating
restaurantSchema.index({ 'profile.category': 1 }); // filter by category
restaurantSchema.index({ 'profile.location.city': 1 }); // filter by city
restaurantSchema.index({ deletedAt: 1 }); // active-restaurant filter
restaurantSchema.index({ owner_id: 1 }); // filter by owner
// ─────────────────────────────────────────────────────────────────────────────
// Query helper – .active()
// ─────────────────────────────────────────────────────────────────────────────
restaurantSchema.query.active = function () {
  return this.where({ deletedAt: null });
};
// ─────────────────────────────────────────────────────────────────────────────
// Pre-save hooks
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Recalculate `profile.globalRating` from the aggregated reviews whenever the
 * document is saved.  The actual aggregation is triggered from the Review
 * service (see services/review.ts) – here we only clamp the stored value
 * so it can never slip outside 0–10 due to a bad direct update.
 */
restaurantSchema.pre('save', function (next) {
  if (this.isModified('profile.globalRating')) {
    this.profile.globalRating = Math.min(10, Math.max(0, this.profile.globalRating));
  }
  next();
});
// ─────────────────────────────────────────────────────────────────────────────
// Static helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Soft-delete a restaurant (sets deletedAt to now).
 * Use this instead of findByIdAndDelete in production.
 */
restaurantSchema.statics.softDelete = function (restaurant_id) {
  return __awaiter(this, void 0, void 0, function* () {
    return this.findByIdAndUpdate(restaurant_id, { deletedAt: new Date() }, { new: true });
  });
};
// ─────────────────────────────────────────────────────────────────────────────
// Model export
// ─────────────────────────────────────────────────────────────────────────────
exports.RestaurantModel = (0, mongoose_1.model)('Restaurant', restaurantSchema);
//# sourceMappingURL=restaurant.js.map
