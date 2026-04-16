import { Schema, model, Types } from 'mongoose';
import { ServicePeriod } from '../utils/servicePeriod';

// Interface
export interface IDish {
    _id?: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    name: string;
    description?: string;
    section: 'Starters' | 'Mains' | 'Desserts' | 'Drinks' | 'Sides' | 'Specials' ;
    price: number;
    images?: string[];
    active: boolean;
    availableAt?: ServicePeriod[];
    ingredients?: string[];
    allergens?: ('gluten' | 'shellfish' | 'nuts' | 'dairy' | 'eggs' | 'soy' | 'fish' | 'sesame' | 'mustard' | 'celery' | 'lupins' | 'molluscs' | 'sulphites')[];    dietaryFlags?: ('vegan' | 'vegetarian' | 'gluten-free' | 'halal' | 'kosher' | 'dairy-free' | 'nut-free')[];
    flavorProfile?: ('spicy' | 'mild' | 'sweet' | 'sour' | 'salty' | 'bitter' | 'umami' | 'smoky' | 'rich' | 'light' | 'creamy' | 'tangy' | 'fresh' | 'hearty' | 'nutty' )[];
    cuisineTags?: string[];
    portionSize?: 'small' | 'medium' | 'large' | 'sharing';
}

// Schema
const dishSchema = new Schema<IDish>({
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    section: { type: String, enum: ['Starters', 'Mains', 'Desserts', 'Drinks', 'Sides', 'Specials'], required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    active: { type: Boolean, default: true, required: true },
    availableAt: { type: [{ type: String, enum: ['breakfast', 'brunch', 'lunch', 'happy-hour', 'dinner', 'all-day'] }], required: true,
        validate: { validator: (v: string[]) => v.length > 0, message: 'A dish must be available in at least one service period' }
    },
    ingredients: [{ type: String }],
    allergens: [{ type: String, enum: ['gluten', 'shellfish', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'sesame', 'mustard', 'celery', 'lupins', 'molluscs', 'sulphites'] }],
    dietaryFlags: [{ type: String, enum: ['vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free'] }],
    flavorProfile: [{ type: String, enum: ['spicy', 'mild', 'sweet', 'sour', 'salty', 'bitter', 'umami', 'smoky', 'rich', 'light', 'creamy', 'tangy', 'fresh', 'hearty', 'nutty'] }],
    cuisineTags: [{ type: String,
        enum: [
            'Italià', 'Japonès', 'Sushi', 'Mexicà', 'Xinès', 'Indi', 'Tailandès', 'Francès',
            'Mediterrani', 'Espanyol', 'Grec', 'Turc', 'Coreà', 'Vietnamita','Alemany', 'Brasileny',
            'Peruà', 'Vegà', 'Vegetarià', 'Marisc', 'Carn', 'Pizzeria', 'Gluten Free', 'Gourmet',
            'Fast Food', 'Street Food', 'Wine', 'Tapa', 'Gelateria', 'Sandwich', 'Ramen', 'Cafeteria'
        ]
    }],
    portionSize: { type: String, enum: ['small', 'medium', 'large', 'sharing'] },
}, { timestamps: true });

// Indexes
dishSchema.index({ restaurant_id: 1 });
dishSchema.index({ restaurant_id: 1, section: 1 });
dishSchema.index({ restaurant_id: 1, active: 1 });
dishSchema.index({ availableAt: 1, restaurant_id: 1 });
dishSchema.index({ dietaryFlags: 1 });
dishSchema.index({ allergens: 1 });
dishSchema.index({ flavorProfile: 1 });
dishSchema.index({ cuisineTags: 1 });

// Model
export const DishModel = model<IDish>('Dish', dishSchema);