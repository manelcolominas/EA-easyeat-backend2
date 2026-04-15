import { Schema, model, Types } from 'mongoose';

export interface IDishRating {
    _id?: Types.ObjectId;
    customer_id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    dish_id: Types.ObjectId;
    rating: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const dishRatingSchema = new Schema<IDishRating>(
    {
        customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
        restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
        dish_id: { type: Schema.Types.ObjectId, ref: 'Dish', required: true, index: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
    },
    { timestamps: true }
);

dishRatingSchema.index({ customer_id: 1, dish_id: 1 }, { unique: true, name: 'unique_customer_dish_rating' });
dishRatingSchema.index({ restaurant_id: 1, dish_id: 1 }, { name: 'restaurant_dish_rating_lookup' });
dishRatingSchema.index({ restaurant_id: 1, rating: -1 }, { name: 'restaurant_rating_sort' });

export const DishRatingModel = model<IDishRating>('DishRating', dishRatingSchema);