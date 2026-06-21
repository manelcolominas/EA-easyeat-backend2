'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DishModel = void 0;
const mongoose_1 = require('mongoose');
// Schema
const dishSchema = new mongoose_1.Schema(
  {
    restaurant_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    section: { type: String, enum: ['Starters', 'Mains', 'Desserts', 'Drinks', 'Sides', 'Specials'], required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    active: { type: Boolean, default: true, required: true },
    availableAt: {
      type: [{ type: String, enum: ['breakfast', 'brunch', 'lunch', 'happy-hour', 'dinner', 'all-day'] }],
      required: true,
      validate: { validator: (v) => v.length > 0, message: 'A dish must be available in at least one service period' }
    },
    ingredients: [{ type: String }],
    allergens: [{ type: String, enum: ['gluten', 'shellfish', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'sesame', 'mustard', 'celery', 'lupins', 'molluscs', 'sulphites'] }],
    dietaryFlags: [{ type: String, enum: ['vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free'] }],
    flavorProfile: [{ type: String, enum: ['spicy', 'mild', 'sweet', 'sour', 'salty', 'bitter', 'umami', 'smoky', 'rich', 'light', 'creamy', 'tangy', 'fresh', 'hearty', 'nutty'] }],
    cuisineTags: [
      {
        type: String,
        enum: [
          'Italià',
          'Japonès',
          'Sushi',
          'Mexicà',
          'Xinès',
          'Indi',
          'Tailandès',
          'Francès',
          'Mediterrani',
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
          'Gluten Free',
          'Gourmet',
          'Fast Food',
          'Street Food',
          'Wine',
          'Tapa',
          'Gelateria',
          'Sandwich',
          'Ramen',
          'Cafeteria'
        ]
      }
    ],
    portionSize: { type: String, enum: ['small', 'medium', 'large', 'sharing'] },
    avgRating: { type: Number, min: 0, max: 10, default: 0 },
    ratingsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);
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
exports.DishModel = (0, mongoose_1.model)('Dish', dishSchema);
//# sourceMappingURL=dish.js.map
