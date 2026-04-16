import { Schema, model, Types } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IDishRating {
    _id?: Types.ObjectId;
    customer_id:   Types.ObjectId;
    dish_id:       Types.ObjectId;
    restaurant_id: Types.ObjectId;
    rating:        number;
    deletedAt?:    Date | null;
    createdAt?:    Date;
    updatedAt?:    Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const dishRatingSchema = new Schema<IDishRating>(
    {
        customer_id:   { type: Schema.Types.ObjectId, ref: 'Customer',   required: true },
        dish_id:       { type: Schema.Types.ObjectId, ref: 'Dish',       required: true },
        restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        rating: {
            type:     Number,
            required: true,
            min: [0,  'Rating cannot be below 0'],
            max: [10, 'Rating cannot exceed 10'],
        },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// One active rating per customer+dish (soft-deleted duplicates are allowed)
dishRatingSchema.index(
    { customer_id: 1, dish_id: 1 },
    {
        unique:                   true,
        partialFilterExpression:  { deletedAt: null },
        name:                     'unique_active_customer_dish',
    }
);

// Fast lookup by dish (listing + analytics)
dishRatingSchema.index({ dish_id: 1, deletedAt: 1, createdAt: -1 });
// Fast lookup by customer (profile page)
dishRatingSchema.index({ customer_id: 1, deletedAt: 1, createdAt: -1 });
// Fast lookup by restaurant (future analytics)
dishRatingSchema.index({ restaurant_id: 1, deletedAt: 1, createdAt: -1 });

// ─── Model ────────────────────────────────────────────────────────────────────

export const DishRatingModel = model<IDishRating>('DishRating', dishRatingSchema);
