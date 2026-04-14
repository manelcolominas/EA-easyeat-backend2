import { Schema, model, Types, Model, Query } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const RESTAURANT_CATEGORIES = [
    'Italià', 'Japonès', 'Sushi', 'Mexicà', 'Xinès', 'Indi', 'Tailandès', 'Francès',
    'Espanyol', 'Grec', 'Turc', 'Coreà', 'Vietnamita', 'Alemany', 'Brasileny', 'Peruà',
    'Vegà', 'Vegetarià', 'Marisc', 'Carn', 'Pizzeria', 'Cafeteria', 'Ramen', 'Gluten Free',
    'Gourmet', 'Fast Food', 'Buffet', 'Food Truck', 'Lounge', 'Pub', 'Wine Bar', 'Rooftop',
    'Bar', 'Taperia', 'Gelateria', 'Estrella Michelin', 'Street Food',
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface ITimetableSlot {
    open:  string; // "HH:MM"
    close: string; // "HH:MM"
}

export interface ITimetable {
    monday?:    ITimetableSlot[];
    tuesday?:   ITimetableSlot[];
    wednesday?: ITimetableSlot[];
    thursday?:  ITimetableSlot[];
    friday?:    ITimetableSlot[];
    saturday?:  ITimetableSlot[];
    sunday?:    ITimetableSlot[];
}

export interface IGeoPoint {
    type:        'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface IRestaurantLocation {
    city:           string;           // required
    address?:       string;           // optional
    googlePlaceId?: string;           // optional
    coordinates:    IGeoPoint;        // required – GeoJSON Point
}

export interface IRestaurantContact {
    phone?: string;
    email?: string;
}

export interface IRestaurantProfile {
    name:        string;              // required, unique per city (compound index)
    description: string;             // required
    globalRating:      number;             // 0–10, default 0, updated from reviews
    category:    RestaurantCategory[]; // required, enum-validated
    timetable?:  ITimetable;
    image?:      string[];
    contact?:    IRestaurantContact;
    location:    IRestaurantLocation; // required
}

// ─────────────────────────────────────────────────────────────────────────────
// Root interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IRestaurant {
    _id?:       Types.ObjectId;
    profile:    IRestaurantProfile;
    employees?: Types.ObjectId[];
    dishes?:    Types.ObjectId[];
    rewards?:   Types.ObjectId[];
    statistics?: Types.ObjectId;
    badges?:    Types.ObjectId[];
    visits?:    Types.ObjectId[];
    reviews?:   Types.ObjectId[];
    deletedAt?: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query-helper interface  (enables Model.find().active())
// ─────────────────────────────────────────────────────────────────────────────

export interface RestaurantQueryHelpers {
    /** Filters out soft-deleted documents (deletedAt !== null). */
    active(this: RestaurantQuery): RestaurantQuery;
}

type RestaurantQuery = Query<any, IRestaurant> & RestaurantQueryHelpers;

export interface RestaurantModelType extends Model<IRestaurant, RestaurantQueryHelpers> {
    softDelete(restaurant_id: string): Promise<IRestaurant | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Regex validators (reused in schema)
// ─────────────────────────────────────────────────────────────────────────────

/** International phone number (allows spaces and hyphens) */
const PHONE_REGEX = /^\+?[1-9][\d\s\-]{1,18}$/i;

/** Simple RFC-5322-like e-mail check */
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/** "HH:MM" – 00:00 … 23:59 */
const TIME_REGEX  = /^([01]\d|2[0-3]):[0-5]\d$/;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────────────────────────────────────

const timetableSlotSchema = new Schema<ITimetableSlot>(
    {
        open:  { type: String, required: true, validate: { validator: (v: string) => TIME_REGEX.test(v),
                message:   (p: { value: string }) => `"${p.value}" is not a valid HH:MM time.`}
        },

        close: { type: String, required: true, validate: { validator: (v: string) => TIME_REGEX.test(v),
                message:   (p: { value: string }) => `"${p.value}" is not a valid HH:MM time.`},
        },
    },
    { _id: false }
);

const timetableSchema = new Schema<ITimetable>(
    {
        monday:    [timetableSlotSchema],
        tuesday:   [timetableSlotSchema],
        wednesday: [timetableSlotSchema],
        thursday:  [timetableSlotSchema],
        friday:    [timetableSlotSchema],
        saturday:  [timetableSlotSchema],
        sunday:    [timetableSlotSchema],
    },
    { _id: false }
);

const geoPointSchema = new Schema<IGeoPoint>(
    {
        type: { type: String, enum: ['Point'], required: true, default: 'Point' },
        coordinates: { type: [Number], required: true,
            validate: {
                validator: (v: number[]) =>
                    v.length === 2
                    && v[0] >= -180 && v[0] <= 180   // longitude
                    && v[1] >= -90  && v[1] <= 90,   // latitude
                message: 'coordinates must be [longitude (-180..180), latitude (-90..90)].',
            },
        },
    },
    { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Root schema
// ─────────────────────────────────────────────────────────────────────────────

const restaurantSchema = new Schema<IRestaurant, RestaurantModelType, {}, RestaurantQueryHelpers>(
    {
        profile: {
            name: { type: String, required: [true, 'Restaurant name is required.'],
                trim: true, minlength: [2, 'Name must be at least 2 characters.'],
                maxlength: [120, 'Name must be at most 120 characters.']
            },
            description: { type: String, required: [true, 'Description is required.'],
                trim: true, minlength: [10,   'Description must be at least 10 characters.'],
                maxlength: [2000, 'Description must be at most 2000 characters.'],
            },
            globalRating: { type: Number, default: 0, min: [0,  'globalRating cannot be below 0.'],
                max: [10, 'globalRating cannot exceed 10.'],
            },
            category: { type: [{ type: String, enum: RESTAURANT_CATEGORIES }],
                required: [true, 'At least one category is required.'],
                validate: { validator: (v: string[]) => v.length >= 1,
                    message:   'category must contain at least one value.',
                }
            },
            timetable: { type: timetableSchema, required: false },
            image: [{ type: String }],
            contact: { phone: { type: String, trim: true,
                    validate: {
                        validator: (v: string) => PHONE_REGEX.test(v),
                        message:   (p: { value: string }) => `"${p.value}" is not a valid phone number.`,
                    },
                },
                email: { type: String, trim: true, lowercase: true,
                    validate: {
                        validator: (v: string) => EMAIL_REGEX.test(v),
                        message:   (p: { value: string }) => `"${p.value}" is not a valid e-mail address.`,
                    },
                },
            },
            location: {
                city: { type: String, required:  [true, 'City is required.'], trim: true },
                address: { type: String, trim: true, required: false },
                googlePlaceId: { type: String, required: false },
                coordinates: { type: geoPointSchema, required: [true, 'GeoJSON coordinates are required.'] },
            },
        },
        employees:  [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
        dishes:     [{ type: Schema.Types.ObjectId, ref: 'Dish'     }],
        rewards:    [{ type: Schema.Types.ObjectId, ref: 'Reward'   }],
        statistics: { type: Schema.Types.ObjectId,  ref: 'Statistics' },
        badges:     [{ type: Schema.Types.ObjectId, ref: 'Badge'    }],
        visits:     [{ type: Schema.Types.ObjectId, ref: 'Visit'    }],
        reviews:    [{ type: Schema.Types.ObjectId, ref: 'Review'   }],
        deletedAt:  { type: Date, default: null },
    },
    {
        timestamps: true,     // adds createdAt / updatedAt
        versionKey: false,    // removes __v
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// 1. GeoJSON 2dsphere – required for $geoNear / $near queries
restaurantSchema.index({ 'profile.location.coordinates': '2dsphere' });

// 2. Unique name per city (case-insensitive enforced at app layer via trim/lowercase)
restaurantSchema.index({ 'profile.name': 1, 'profile.location.city': 1 }, { unique: true, name: 'unique_name_per_city' });

// 3. Performance – common query fields
restaurantSchema.index({ 'profile.globalRating': -1 });   // sort by globalRating
restaurantSchema.index({ 'profile.category': 1 });   // filter by category
restaurantSchema.index({ 'profile.location.city': 1 }); // filter by city
restaurantSchema.index({ deletedAt: 1 });   // active-restaurant filter

// ─────────────────────────────────────────────────────────────────────────────
// Query helper – .active()
// ─────────────────────────────────────────────────────────────────────────────

restaurantSchema.query.active = function (this: RestaurantQuery): RestaurantQuery {
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
        this.profile.globalRating = Math.min(10, Math.max(0, this.profile.globalRating)); }
    next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Static helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soft-delete a restaurant (sets deletedAt to now).
 * Use this instead of findByIdAndDelete in production.
 */
restaurantSchema.statics.softDelete = async function ( restaurant_id: string ): Promise<IRestaurant | null> {
    return this.findByIdAndUpdate( restaurant_id, { deletedAt: new Date() }, { new: true } );
};

// ─────────────────────────────────────────────────────────────────────────────
// Model export
// ─────────────────────────────────────────────────────────────────────────────

export const RestaurantModel = model<IRestaurant, RestaurantModelType>('Restaurant', restaurantSchema );