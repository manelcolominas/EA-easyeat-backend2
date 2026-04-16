import { Schema, model, Types } from 'mongoose';

export interface IReview {
  _id?: Types.ObjectId;

  customer_id: Types.ObjectId;
  restaurant_id: Types.ObjectId;

  globalRating: number;
  dishRatings?: {
    dish_id: Types.ObjectId;
    rating: number;
  }[];

  images: string[];

  ratings?: {
    foodQuality?: number;
    staffService?: number;
    cleanliness?: number;
    environment?: number;
  };

  comment?: string;
  likes?: number;
  deletedAt?: Date | null;
  deleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },

    globalRating: { type: Number, required: true, min: 0, max: 10 },
    dishRatings: [{
      dish_id: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
      rating: { type: Number, required: true, min: 0, max: 10 }
    }],

    images: { type: [String], default: [] },

    ratings: {
      foodQuality: { type: Number, min: 0, max: 10 },
      staffService: { type: Number, min: 0, max: 10 },
      cleanliness: { type: Number, min: 0, max: 10 },
      environment: { type: Number, min: 0, max: 10 }
    },

    comment: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
    deleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ customer_id: 1, deletedAt: 1 });
reviewSchema.index({ restaurant_id: 1, deletedAt: 1 });
reviewSchema.index({ globalRating: -1 });
reviewSchema.index({ likes: -1 });
reviewSchema.index({ restaurant_id: 1, globalRating: -1 }, { name: 'restaurant_globalRating_sort' });


// 3️⃣ Model
export const ReviewModel = model<IReview>('Review', reviewSchema);
