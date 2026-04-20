import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Request, Response } from 'express';
import { IBadge } from '../models/badge';
import { ICustomer } from '../models/customer';
import { IEmployee } from '../models/employee';
import { IPointsWallet } from '../models/pointsWallet';
import { IRestaurant } from '../models/restaurant';
import { IReview } from '../models/review';
import { IReward } from '../models/reward';
import { IRewardRedemption } from '../models/rewardRedemption';
import { IStatistics } from '../models/statistics';
import { IVisit } from '../models/visit';
import { IDish } from '../models/dish';
import { IDishRating } from '../models/dishRating';

import Logging from '../library/logging';

export const ValidateJoi = (
    schema: ObjectSchema,
    property: 'body' | 'query' | 'params' = 'body'
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const source = req[property];
            await schema.validateAsync(source, { abortEarly: false });
            next();
        } catch (error) {
            Logging.error(error);
            return res.status(422).json({ error });
        }
    };
};

// ─── Reusable primitives ──────────────────────────────────────────────────────

const timetableDaySchema = Joi.array().items(
    Joi.object({
        open:  Joi.string(),
        close: Joi.string(),
    })
);

const timetableSchema = Joi.object({
    monday:    timetableDaySchema,
    tuesday:   timetableDaySchema,
    wednesday: timetableDaySchema,
    thursday:  timetableDaySchema,
    friday:    timetableDaySchema,
    saturday:  timetableDaySchema,
    sunday:    timetableDaySchema,
});

const categoryEnum = [
    'Italià', 'Japonès', 'Sushi', 'Mexicà', 'Xinès', 'Indi', 'Tailandès', 'Francès',
    'Espanyol', 'Grec', 'Turc', 'Coreà', 'Vietnamita', 'Alemany', 'Brasileny', 'Peruà',
    'Vegà', 'Vegetarià', 'Marisc', 'Carn', 'Pizzeria', 'Cafeteria', 'Ramen', 'Gluten Free',
    'Gourmet', 'Fast Food', 'Buffet', 'Food Truck', 'Lounge', 'Pub', 'Wine Bar', 'Rooftop',
    'Bar', 'Taperia', 'Gelateria', 'Estrella Michelin', 'Street Food',
];

const objectId = Joi.string().length(24).hex();

const passwordSchema = Joi.string().min(8).max(128).pattern(/[A-Z]/, 'uppercase letter').pattern(/[0-9]/, 'number')
    .messages({
        'string.pattern.name': 'Password must contain at least one {{#name}}',
        'string.min':          'Password must be at least 8 characters long',
    });

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const Schemas = {

    badge: {
        create: Joi.object<IBadge>({
            title:       Joi.string().required(),
            description: Joi.string().required(),
            type:        Joi.string().required(),
        }),
        update: Joi.object<IBadge>({
            title:       Joi.string(),
            description: Joi.string(),
            type:        Joi.string(),
        }),
    },

    customer: {
        create: Joi.object<ICustomer>({
            name:                Joi.string().min(2).max(100).required(),
            email:               Joi.string().email().required(),
            password:            passwordSchema.required(),         
            isActive:            Joi.boolean().default(true),
            profilePictures:     Joi.array().items(Joi.string().uri()),
            pointsWallet:        Joi.array().items(objectId),
            visitHistory:        Joi.array().items(objectId),
            favoriteRestaurants: Joi.array().items(objectId),
            badges:              Joi.array().items(objectId),
            reviews:             Joi.array().items(objectId),
        }),
        update: Joi.object<ICustomer>({
            name:                Joi.string().min(2).max(100),           
            email:               Joi.string().email(),
            password:            passwordSchema,
            isActive:            Joi.boolean(),
            profilePictures:     Joi.array().items(Joi.string().uri()),
            pointsWallet:        Joi.array().items(objectId),
            visitHistory:        Joi.array().items(objectId),
            favoriteRestaurants: Joi.array().items(objectId),
            badges:              Joi.array().items(objectId),
            reviews:             Joi.array().items(objectId),
        }),
    },

    employee: {
        create: Joi.object<IEmployee>({
            restaurant_id: objectId.required(),
            profile: Joi.object({
                name:     Joi.string().required(),
                email:    Joi.string().email(),
                phone:    Joi.string().trim(),
                password: passwordSchema,
                role:     Joi.string().valid('owner', 'staff').default('staff').required(),
            }).required(),
            isActive: Joi.boolean().default(true),
        }),
        update: Joi.object<IEmployee>({
            profile: Joi.object({
                name:     Joi.string(),
                email:    Joi.string().email(),
                phone:    Joi.string().trim(),
                password: passwordSchema,
                role:     Joi.string().valid('owner', 'staff'),
            }),
            isActive: Joi.boolean(),
        }),
    },

    pointsWallet: {
        create: Joi.object<IPointsWallet>({
            customer_id:   objectId.required(),
            restaurant_id: objectId.required(),
            points:        Joi.number().min(0).default(0),
        }),
        update: Joi.object<IPointsWallet>({
            points: Joi.number().min(0).required(),
        }),
    },

    rewardRedemption: {
    create: Joi.object<IRewardRedemption>({
        customer_id:   objectId.required(),
        restaurant_id: objectId.required(),
        reward_id:     objectId.required(),
        employee_id:   objectId.allow(null),
        pointsUsed:    Joi.number().min(0).required(),
        status:        Joi.string().valid('pending', 'approved', 'redeemed', 'cancelled', 'expired').default('pending'),
        redeemedAt:    Joi.date().allow(null),
        notes:         Joi.string().trim().allow('')
    }),

    update: Joi.object<IRewardRedemption>({
        employee_id: objectId.allow(null),
        pointsUsed:  Joi.number().min(0),
        status:      Joi.string().valid('pending', 'approved', 'redeemed', 'cancelled', 'expired'),
        redeemedAt:  Joi.date().allow(null),
        notes:       Joi.string().trim().allow('')
    }),

    redeem: Joi.object({
        customer_id: Joi.string().hex().length(24).required(),
        reward_id: Joi.string().hex().length(24).required(),
        employee_id: Joi.string().hex().length(24).required(),
        notes: Joi.string().trim().optional().allow('')
    }),

    updateStatus: Joi.object({
        status: Joi.string()
            .valid('pending', 'approved', 'redeemed', 'cancelled', 'expired')
            .required(),
        employee_id: Joi.string().hex().length(24).optional().allow(null, ''),
        notes: Joi.string().trim().optional().allow('')
    }),
},

    review: {
        create: Joi.object<IReview>({
            customer_id:   objectId,
            restaurant_id: objectId.required(),
            globalRating:  Joi.number().min(0).max(10),
            ratings: Joi.object({
                foodQuality:  Joi.number().min(0).max(10),
                staffService: Joi.number().min(0).max(10),
                cleanliness:  Joi.number().min(0).max(10),
                environment:  Joi.number().min(0).max(10),
            }),
            images: Joi.array().items(Joi.string()),
            comment: Joi.string().allow(''),
            likes:   Joi.number().min(0).default(0),
        }),
        update: Joi.object<IReview>({
            globalRating: Joi.number().min(0).max(10),
            ratings: Joi.object({
                foodQuality:  Joi.number().min(0).max(10),
                staffService: Joi.number().min(0).max(10),
                cleanliness:  Joi.number().min(0).max(10),
                environment:  Joi.number().min(0).max(10),
            }),
            images: Joi.array().items(Joi.string()),
            comment: Joi.string().allow(''),
            likes:   Joi.number().min(0),
        })
            .unknown(true),
    },
    reward: {
        create: Joi.object<IReward>({
            restaurant_id:  objectId.required(),
            name:           Joi.string().required(),
            description:    Joi.string().required(),
            pointsRequired: Joi.number().min(0),
            active:         Joi.boolean().default(true),
            expiry:         Joi.date(),
            timesRedeemed:  Joi.number().min(0).default(0),
        }),
        update: Joi.object<IReward>({
            name:           Joi.string(),
            description:    Joi.string(),
            pointsRequired: Joi.number().min(0),
            active:         Joi.boolean(),
            expiry:         Joi.date(),
            timesRedeemed:  Joi.number().min(0),
        }),
    },

    statistics: {
        create: Joi.object<IStatistics>({
            restaurant_id:         objectId.required(),
            totalPointsGiven:      Joi.number().min(0).default(0),
            loyalCustomers:        Joi.number().min(0).default(0),
            mostRequestedRewards:  Joi.array().items(objectId),
            averagePointsPerVisit: Joi.number().min(0).default(0),
        }),
        update: Joi.object<IStatistics>({
            totalPointsGiven:      Joi.number().min(0),
            loyalCustomers:        Joi.number().min(0),
            mostRequestedRewards:  Joi.array().items(objectId),
            averagePointsPerVisit: Joi.number().min(0),
        }),
    },

    visit: {
        create: Joi.object<IVisit>({
            customer_id:   objectId.required(),
            restaurant_id: objectId.required(),
            date:          Joi.date().default(() => new Date()),
            pointsEarned:  Joi.number().min(0).default(0),
            billAmount:    Joi.number().min(0).default(0),
            deletedAt:     Joi.any().strip(),
        }),
        update: Joi.object<IVisit & { deletedAt?: any }>({
            date:         Joi.date(),
            pointsEarned: Joi.number().min(0),
            billAmount:   Joi.number().min(0),
            deletedAt:    Joi.date().allow(null).optional(),
        }),
    },

    restaurant: {
        create: Joi.object<IRestaurant>({
            profile: Joi.object({
                name:        Joi.string().min(2).max(120).required(),
                description: Joi.string().min(10).max(2000).required(),
                category:    Joi.array().items(Joi.string().valid(...categoryEnum)).min(1).required(),
                globalRating:      Joi.number().min(0).max(10),
                timetable:   timetableSchema,
                image:       Joi.array().items(Joi.string()),
                contact: Joi.object({
                    phone: Joi.string(),
                    email: Joi.string().email(),
                }),
                location: Joi.object({
                    city:          Joi.string().required(),
                    address:       Joi.string().allow(''),
                    googlePlaceId: Joi.string(),
                    coordinates: Joi.object({
                        type:        Joi.string().valid('Point'),
                        coordinates: Joi.array().items(Joi.number()).length(2),
                    }).optional(),
                }).required(),
            }).required(),
            employees:  Joi.array().items(objectId),
            dishes:     Joi.array().items(objectId),
            rewards:    Joi.array().items(objectId),
            statistics: objectId,
            badges:     Joi.array().items(objectId),
        }),

        update: Joi.object<IRestaurant>({
            profile: Joi.object({
                name:        Joi.string(),
                description: Joi.string(),
                globalRating:      Joi.number().min(0).max(10),
                category:    Joi.array().items(Joi.string().valid(...categoryEnum)),
                timetable:   timetableSchema,
                image:       Joi.array().items(Joi.string().uri()),
                contact: Joi.object({
                    phone: Joi.string(),
                    email: Joi.string().email(),
                }),
                location: Joi.object({
                    city:          Joi.string(),
                    address:       Joi.string(),
                    googlePlaceId: Joi.string(),
                    coordinates: Joi.object({
                        type:        Joi.string().valid('Point'),
                        coordinates: Joi.array().items(Joi.number()).length(2),
                    }),
                }),
            }),
            employees:  Joi.array().items(objectId),
            dishes:     Joi.array().items(objectId),
            rewards:    Joi.array().items(objectId),
            statistics: objectId,
            badges:     Joi.array().items(objectId),
        }),
    },

    dish: {
        create: Joi.object<IDish>({
            restaurant_id: objectId.required(),
            name:          Joi.string().required(),
            description:   Joi.string().required(),
            section:       Joi.string().valid('Starters', 'Mains', 'Desserts', 'Drinks', 'Sides', 'Specials').required(),
            price:         Joi.number().min(0).required(),
            images:        Joi.array().items(Joi.string().uri()),
            active:        Joi.boolean().default(true),
            availableAt:   Joi.array().items(Joi.string().valid('breakfast', 'brunch', 'lunch', 'happy-hour', 'dinner', 'all-day')).required(),
            ingredients:   Joi.array().items(Joi.string()),
            allergens:     Joi.array().items(Joi.string().valid('gluten', 'shellfish', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'sesame', 'mustard', 'celery', 'lupins', 'molluscs', 'sulphites')),
            dietaryFlags:  Joi.array().items(Joi.string().valid('vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free')),
            flavorProfile: Joi.array().items(Joi.string().valid('spicy', 'mild', 'sweet', 'sour', 'salty', 'bitter', 'umami', 'smoky', 'rich', 'light', 'creamy', 'tangy', 'fresh', 'hearty', 'nutty')),
            cuisineTags:   Joi.array().items(Joi.string().valid(...categoryEnum)),
            portionSize:   Joi.string().valid('small', 'medium', 'large', 'sharing'),
            avgRating:     Joi.forbidden(),
            ratingsCount:  Joi.forbidden()
        }),
        update: Joi.object<IDish>({
            name:          Joi.string(),
            description:   Joi.string(),
            section:       Joi.string().valid('Starters', 'Mains', 'Desserts', 'Drinks', 'Sides', 'Specials'),
            price:         Joi.number().min(0),
            images:         Joi.array().items(Joi.string().uri()),
            active:        Joi.boolean(),
            availableAt:   Joi.array().items(Joi.string().valid('breakfast', 'brunch', 'lunch', 'happy-hour', 'dinner', 'all-day')).required(),
            ingredients:   Joi.array().items(Joi.string()),
            allergens:     Joi.array().items(Joi.string().valid('gluten', 'shellfish', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'sesame', 'mustard', 'celery', 'lupins', 'molluscs', 'sulphites')),
            dietaryFlags:  Joi.array().items(Joi.string().valid('vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free')),
            flavorProfile: Joi.array().items(Joi.string().valid('spicy', 'mild', 'sweet', 'sour', 'salty', 'bitter', 'umami', 'smoky', 'rich', 'light', 'creamy', 'tangy', 'fresh', 'hearty', 'nutty')),
            cuisineTags:   Joi.array().items(Joi.string().valid(...categoryEnum)),
            portionSize:   Joi.string().valid('small', 'medium', 'large', 'sharing'),
            avgRating:     Joi.forbidden(),
            ratingsCount:  Joi.forbidden()
        })
    },

    dishRating: {
        create: Joi.object<IDishRating>({
            customer_id: objectId.required(),
            dish_id:     objectId.required(),
            rating:      Joi.number().min(0).max(10).required(),
        }),
        update: Joi.object<IDishRating>({
            rating:  Joi.number().min(0).max(10),
        }),
    },

}
