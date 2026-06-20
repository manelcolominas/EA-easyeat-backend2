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
exports.Schemas = exports.ValidateJoi = void 0;
const joi_1 = __importDefault(require("joi"));
const logging_1 = __importDefault(require("../library/logging"));
const ValidateJoi = (schema, property = 'body') => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const source = req[property];
            yield schema.validateAsync(source, { abortEarly: false });
            next();
        }
        catch (error) {
            logging_1.default.error(error);
            return res.status(422).json({ error });
        }
    });
};
exports.ValidateJoi = ValidateJoi;
// ─── Reusable primitives ──────────────────────────────────────────────────────
const timetableDaySchema = joi_1.default.array().items(joi_1.default.object({
    open: joi_1.default.string(),
    close: joi_1.default.string()
}));
const timetableSchema = joi_1.default.object({
    monday: timetableDaySchema,
    tuesday: timetableDaySchema,
    wednesday: timetableDaySchema,
    thursday: timetableDaySchema,
    friday: timetableDaySchema,
    saturday: timetableDaySchema,
    sunday: timetableDaySchema
});
const categoryEnum = [
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
const objectId = joi_1.default.string().length(24).hex();
const passwordSchema = joi_1.default.string().min(8).max(128).pattern(/[A-Z]/, 'uppercase letter').pattern(/[0-9]/, 'number').messages({
    'string.pattern.name': 'Password must contain at least one {{#name}}',
    'string.min': 'Password must be at least 8 characters long'
});
const pointsSystemSchema = joi_1.default.object({
    method: joi_1.default.string().valid('simple', 'exponential').required(),
    pointsPerEuro: joi_1.default.number().min(0).allow(null),
    maxPointsVisit: joi_1.default.number().min(0).allow(null)
});
// ─── Schemas ──────────────────────────────────────────────────────────────────
exports.Schemas = {
    badge: {
        create: joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            type: joi_1.default.string().required()
        }),
        update: joi_1.default.object({
            _id: objectId,
            __v: joi_1.default.number(),
            title: joi_1.default.string(),
            description: joi_1.default.string(),
            type: joi_1.default.string()
        }).unknown(true)
    },
    customer: {
        create: joi_1.default.object({
            name: joi_1.default.string().min(2).max(100).required(),
            email: joi_1.default.string().email().required(),
            password: passwordSchema.required(),
            isActive: joi_1.default.boolean().default(true),
            profilePictures: joi_1.default.array().items(joi_1.default.string().uri()),
            pointsWallet: joi_1.default.array().items(objectId),
            visitHistory: joi_1.default.array().items(objectId),
            favoriteRestaurants: joi_1.default.array().items(objectId),
            badges: joi_1.default.array().items(objectId),
            reviews: joi_1.default.array().items(objectId)
        }),
        update: joi_1.default.object({
            _id: objectId,
            __v: joi_1.default.number(),
            name: joi_1.default.string().min(2).max(100),
            email: joi_1.default.string().email(),
            password: passwordSchema,
            isActive: joi_1.default.boolean(),
            profilePictures: joi_1.default.array().items(joi_1.default.string().uri()),
            pointsWallet: joi_1.default.array().items(objectId),
            visitHistory: joi_1.default.array().items(objectId),
            favoriteRestaurants: joi_1.default.array().items(objectId),
            badges: joi_1.default.array().items(objectId),
            reviews: joi_1.default.array().items(objectId)
        }).unknown(true)
    },
    employee: {
        create: joi_1.default.object({
            restaurant_id: objectId.required(),
            profile: joi_1.default.object({
                name: joi_1.default.string().required(),
                email: joi_1.default.string().email(),
                phone: joi_1.default.string().trim(),
                password: passwordSchema,
                role: joi_1.default.string().valid('owner', 'staff').default('staff').required()
            }).required(),
            isActive: joi_1.default.boolean().default(true)
        }),
        update: joi_1.default.object({
            _id: objectId,
            __v: joi_1.default.number(),
            restaurant_id: objectId,
            profile: joi_1.default.object({
                name: joi_1.default.string(),
                email: joi_1.default.string().email(),
                phone: joi_1.default.string().trim(),
                password: passwordSchema,
                role: joi_1.default.string().valid('owner', 'staff')
            }),
            isActive: joi_1.default.boolean()
        }).unknown(true)
    },
    pointsWallet: {
        create: joi_1.default.object({
            customer_id: objectId.required(),
            restaurant_id: objectId.required(),
            points: joi_1.default.number().min(0).default(0)
        }),
        update: joi_1.default.object({
            points: joi_1.default.number().min(0).required()
        }).unknown(true)
    },
    rewardRedemption: {
        create: joi_1.default.object({
            customer_id: objectId.required(),
            restaurant_id: objectId.required(),
            reward_id: objectId.required(),
            employee_id: objectId.allow(null),
            pointsUsed: joi_1.default.number().min(0).required(),
            status: joi_1.default.string().valid('pending', 'approved', 'redeemed', 'cancelled', 'expired').default('pending'),
            redeemedAt: joi_1.default.date().allow(null),
            notes: joi_1.default.string().trim().allow('')
        }),
        update: joi_1.default.object({
            employee_id: objectId.allow(null),
            pointsUsed: joi_1.default.number().min(0),
            status: joi_1.default.string().valid('pending', 'approved', 'redeemed', 'cancelled', 'expired'),
            redeemedAt: joi_1.default.date().allow(null),
            notes: joi_1.default.string().trim().allow('')
        }).unknown(true),
        redeem: joi_1.default.object({
            customer_id: joi_1.default.string().hex().length(24).required(),
            reward_id: joi_1.default.string().hex().length(24).required(),
            employee_id: joi_1.default.string().hex().length(24).required(),
            notes: joi_1.default.string().trim().optional().allow('')
        }),
        updateStatus: joi_1.default.object({
            status: joi_1.default.string().valid('pending', 'approved', 'redeemed', 'cancelled', 'expired').required(),
            employee_id: joi_1.default.string().hex().length(24).optional().allow(null, ''),
            notes: joi_1.default.string().trim().optional().allow('')
        })
    },
    review: {
        create: joi_1.default.object({
            employee_id: objectId.allow(null),
            customer_id: objectId,
            restaurant_id: objectId.required(),
            globalRating: joi_1.default.number().min(0).max(10),
            ratings: joi_1.default.object({
                foodQuality: joi_1.default.number().min(0).max(10),
                staffService: joi_1.default.number().min(0).max(10),
                cleanliness: joi_1.default.number().min(0).max(10),
                environment: joi_1.default.number().min(0).max(10)
            }),
            images: joi_1.default.array().items(joi_1.default.string()),
            comment: joi_1.default.string().allow(''),
            likes: joi_1.default.number().min(0).default(0)
        }),
        update: joi_1.default.object({
            _id: objectId,
            __v: joi_1.default.number(),
            employee_id: objectId.allow(null),
            globalRating: joi_1.default.number().min(0).max(10),
            ratings: joi_1.default.object({
                foodQuality: joi_1.default.number().min(0).max(10),
                staffService: joi_1.default.number().min(0).max(10),
                cleanliness: joi_1.default.number().min(0).max(10),
                environment: joi_1.default.number().min(0).max(10)
            }),
            images: joi_1.default.array().items(joi_1.default.string()),
            comment: joi_1.default.string().allow(''),
            likes: joi_1.default.number().min(0)
        }).unknown(true)
    },
    reward: {
        create: joi_1.default.object({
            restaurant_id: objectId.required(),
            name: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            pointsRequired: joi_1.default.number().min(0),
            active: joi_1.default.boolean().default(true),
            expiry: joi_1.default.date(),
            timesRedeemed: joi_1.default.number().min(0).default(0)
        }),
        update: joi_1.default.object({
            _id: objectId,
            __v: joi_1.default.number(),
            restaurant_id: objectId,
            name: joi_1.default.string(),
            description: joi_1.default.string(),
            pointsRequired: joi_1.default.number().min(0),
            active: joi_1.default.boolean(),
            expiry: joi_1.default.date(),
            timesRedeemed: joi_1.default.number().min(0)
        }).unknown(true)
    },
    statistics: {
        create: joi_1.default.object({
            restaurant_id: objectId.required(),
            totalPointsGiven: joi_1.default.number().min(0).default(0),
            loyalCustomers: joi_1.default.number().min(0).default(0),
            mostRequestedRewards: joi_1.default.array().items(objectId),
            averagePointsPerVisit: joi_1.default.number().min(0).default(0)
        }),
        update: joi_1.default.object({
            totalPointsGiven: joi_1.default.number().min(0),
            loyalCustomers: joi_1.default.number().min(0),
            mostRequestedRewards: joi_1.default.array().items(objectId),
            averagePointsPerVisit: joi_1.default.number().min(0)
        }).unknown(true)
    },
    visit: {
        create: joi_1.default.object({
            customer_id: objectId.required(),
            restaurant_id: objectId.required(),
            employee_id: objectId.required(),
            date: joi_1.default.date().default(() => new Date()),
            pointsEarned: joi_1.default.any().strip(),
            billAmount: joi_1.default.number().min(0).default(0),
            deletedAt: joi_1.default.any().strip()
        }),
        update: joi_1.default.object({
            employee_id: objectId.forbidden(),
            date: joi_1.default.date(),
            pointsEarned: joi_1.default.number().min(0),
            billAmount: joi_1.default.number().min(0),
            deletedAt: joi_1.default.date().allow(null).optional()
        }).unknown(true)
    },
    restaurant: {
        create: joi_1.default.object({
            profile: joi_1.default.object({
                name: joi_1.default.string().min(2).max(120).required(),
                description: joi_1.default.string().min(10).max(2000).required(),
                category: joi_1.default.array()
                    .items(joi_1.default.string().valid(...categoryEnum))
                    .min(1)
                    .required(),
                globalRating: joi_1.default.number().min(0).max(10),
                maxPointsVisit: joi_1.default.number().min(1),
                timetable: timetableSchema,
                image: joi_1.default.array().items(joi_1.default.string()),
                contact: joi_1.default.object({
                    phone: joi_1.default.string(),
                    email: joi_1.default.string().email(),
                    website: joi_1.default.string().allow('')
                }),
                location: joi_1.default.object({
                    city: joi_1.default.string().required(),
                    address: joi_1.default.string().allow(''),
                    googlePlaceId: joi_1.default.string(),
                    coordinates: joi_1.default.object({
                        type: joi_1.default.string().valid('Point'),
                        coordinates: joi_1.default.array().items(joi_1.default.number()).length(2)
                    }).optional()
                }).required(),
                pointsSystem: pointsSystemSchema
            }).required(),
            employees: joi_1.default.array().items(objectId),
            dishes: joi_1.default.array().items(objectId),
            rewards: joi_1.default.array().items(objectId),
            statistics: objectId,
            badges: joi_1.default.array().items(objectId)
        }),
        update: joi_1.default.object({
            _id: joi_1.default.any().strip(),
            __v: joi_1.default.any().strip(),
            restaurant_id: joi_1.default.any().strip(),
            profile: joi_1.default.object({
                name: joi_1.default.string().allow('', null),
                description: joi_1.default.string().allow('', null),
                globalRating: joi_1.default.number().min(0).max(10).allow(null),
                maxPointsVisit: joi_1.default.number().min(0).allow(null),
                category: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string().allow('', null)),
                timetable: joi_1.default.any(),
                image: joi_1.default.array().items(joi_1.default.string()),
                contact: joi_1.default.object({
                    phone: joi_1.default.string().allow('', null),
                    email: joi_1.default.string().email().allow('', null),
                    website: joi_1.default.string().allow('', null)
                }).unknown(true),
                location: joi_1.default.object({
                    city: joi_1.default.string().allow('', null),
                    address: joi_1.default.string().allow('', null),
                    googlePlaceId: joi_1.default.string().allow('', null),
                    coordinates: joi_1.default.any()
                }).unknown(true),
                pointsSystem: joi_1.default.object({
                    method: joi_1.default.string().valid('simple', 'exponential'),
                    pointsPerEuro: joi_1.default.number().min(0).allow(null),
                    maxPointsVisit: joi_1.default.number().min(0).allow(null)
                }).unknown(true)
            }).unknown(true)
        }).unknown(true)
    },
    dish: {
        create: joi_1.default.object({
            restaurant_id: objectId.required(),
            name: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            section: joi_1.default.string().valid('Starters', 'Mains', 'Desserts', 'Drinks', 'Sides', 'Specials').required(),
            price: joi_1.default.number().min(0).required(),
            images: joi_1.default.array().items(joi_1.default.string().uri()),
            active: joi_1.default.boolean().default(true),
            availableAt: joi_1.default.array()
                .items(joi_1.default.string().valid('breakfast', 'brunch', 'lunch', 'happy-hour', 'dinner', 'all-day'))
                .required(),
            ingredients: joi_1.default.array().items(joi_1.default.string()),
            allergens: joi_1.default.array().items(joi_1.default.string().valid('gluten', 'shellfish', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'sesame', 'mustard', 'celery', 'lupins', 'molluscs', 'sulphites')),
            dietaryFlags: joi_1.default.array().items(joi_1.default.string().valid('vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free')),
            flavorProfile: joi_1.default.array().items(joi_1.default.string().valid('spicy', 'mild', 'sweet', 'sour', 'salty', 'bitter', 'umami', 'smoky', 'rich', 'light', 'creamy', 'tangy', 'fresh', 'hearty', 'nutty')),
            cuisineTags: joi_1.default.array().items(joi_1.default.string().valid(...categoryEnum)),
            portionSize: joi_1.default.string().valid('small', 'medium', 'large', 'sharing'),
            avgRating: joi_1.default.forbidden(),
            ratingsCount: joi_1.default.forbidden()
        }),
        update: joi_1.default.object({
            _id: objectId,
            __v: joi_1.default.number(),
            restaurant_id: objectId,
            name: joi_1.default.string(),
            description: joi_1.default.string(),
            section: joi_1.default.string().valid('Starters', 'Mains', 'Desserts', 'Drinks', 'Sides', 'Specials'),
            price: joi_1.default.number().min(0),
            images: joi_1.default.array().items(joi_1.default.string().uri()),
            active: joi_1.default.boolean(),
            availableAt: joi_1.default.array().items(joi_1.default.string().valid('breakfast', 'brunch', 'lunch', 'happy-hour', 'dinner', 'all-day')),
            ingredients: joi_1.default.array().items(joi_1.default.string()),
            allergens: joi_1.default.array().items(joi_1.default.string().valid('gluten', 'shellfish', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'sesame', 'mustard', 'celery', 'lupins', 'molluscs', 'sulphites')),
            dietaryFlags: joi_1.default.array().items(joi_1.default.string().valid('vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free')),
            flavorProfile: joi_1.default.array().items(joi_1.default.string().valid('spicy', 'mild', 'sweet', 'sour', 'salty', 'bitter', 'umami', 'smoky', 'rich', 'light', 'creamy', 'tangy', 'fresh', 'hearty', 'nutty')),
            cuisineTags: joi_1.default.array().items(joi_1.default.string().valid(...categoryEnum)),
            portionSize: joi_1.default.string().valid('small', 'medium', 'large', 'sharing'),
            avgRating: joi_1.default.forbidden(),
            ratingsCount: joi_1.default.forbidden()
        }).unknown(true)
    },
    dishRating: {
        create: joi_1.default.object({
            customer_id: objectId.required(),
            dish_id: objectId.required(),
            rating: joi_1.default.number().min(0).max(10).required()
        }),
        update: joi_1.default.object({
            rating: joi_1.default.number().min(0).max(10)
        })
    }
};
//# sourceMappingURL=joi.js.map