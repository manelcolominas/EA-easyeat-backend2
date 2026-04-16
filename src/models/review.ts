import { Schema, model, Types } from 'mongoose';

// 1️⃣ Interface
export interface IReview {
  _id?: Types.ObjectId;

  customer_id: Types.ObjectId;
  restaurant_id: Types.ObjectId;

  date: Date;
  globalRating: number;
  images: string[];

  ratings?: {
    foodQuality?: number;
    staffService?: number;
    cleanliness?: number;
    environment?: number;
  };

  comment?: string;
  likes?: number;

  // 🔥 NUEVO (soft delete)
  deleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

// 2️⃣ Schema
const reviewSchema = new Schema<IReview>(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    date: { type: Date, required: true, default: Date.now },
    globalRating: { type: Number, required: true, min: 0, max: 10 },
    images: [{ type: String }],
    ratings: {
      foodQuality: { type: Number, min: 0, max: 10 },
      staffService: { type: Number, min: 0, max: 10 },
      cleanliness: { type: Number, min: 0, max: 10 },
      environment: { type: Number, min: 0, max: 10 }
    },
    comment: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    // 🔥 SOFT DELETE
    deleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Evitar duplicados SOLO si no está eliminado
reviewSchema.index( { customer_id: 1, restaurant_id: 1 },
  { unique: true, partialFilterExpression: { deleted: false } }
);

// Para búsquedas rápidas (paginación/filtros)
reviewSchema.index({ customer_id: 1, deleted: 1 });
reviewSchema.index({ restaurant_id: 1, deleted: 1 });
reviewSchema.index({ globalRating: -1 });
reviewSchema.index({ likes: -1 });


// 3️⃣ Model
export const ReviewModel = model<IReview>('Review', reviewSchema);