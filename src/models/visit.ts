import { Schema, model, Types, Query, Document, Model } from 'mongoose';

// ─── 1. Interface ─────────────────────────────────────────────────────────────

export interface IVisit {
    _id?: Types.ObjectId;
    customer_id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    date: Date;
    pointsEarned?: number;
    billAmount?: number;
    deletedAt?: Date | null;
}

// ─── 2. Query helpers ─────────────────────────────────────────────────────────

export interface VisitQueryHelpers {
    active(): Query<any, Document<unknown, any, IVisit> & IVisit> & VisitQueryHelpers;
}

// ─── 3. Model type ────────────────────────────────────────────────────────────

export type VisitModelType = Model<IVisit, VisitQueryHelpers>;

// ─── 4. Schema ────────────────────────────────────────────────────────────────

const visitSchema = new Schema<IVisit, VisitModelType, {}, VisitQueryHelpers>(
    {
        customer_id: {
            type: Schema.Types.ObjectId, ref: 'Customer',
            required: [true, 'customer_id is required'],
        },
        restaurant_id: {
            type: Schema.Types.ObjectId, ref: 'Restaurant',
            required: [true, 'restaurant_id is required'],
        },
        date: { type: Date, default: Date.now, required: true },
        pointsEarned: { type: Number, min: [0, 'pointsEarned must be ≥ 0'], default: 0 },
        billAmount: { type: Number, min: [0, 'billAmount must be ≥ 0'], default: 0 },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// ─── 5. Indexes ───────────────────────────────────────────────────────────────

visitSchema.index({ date: -1 });
visitSchema.index({ customer_id: 1, restaurant_id: 1, deletedAt: 1 });

// ─── 6. Query helper — .active() ─────────────────────────────────────────────

visitSchema.query.active = function (this: VisitModelType) {
    return this.where({ deletedAt: null });
};

// ─── 7. Pre-save relational validation ───────────────────────────────────────

visitSchema.pre('save', async function (next) {
    try {
        const { CustomerModel } = await import('./customer');
        const { RestaurantModel } = await import('./restaurant');

        if (this.isModified('customer_id') || this.isNew) {
            const customerExists = await CustomerModel.exists({ _id: this.customer_id });
            if (!customerExists) {
                return next(new Error(`Customer with id ${this.customer_id} does not exist`));
            }
        }

        if (this.isModified('restaurant_id') || this.isNew) {
            const restaurantExists = await RestaurantModel.exists({ _id: this.restaurant_id });
            if (!restaurantExists) {
                return next(new Error(`Restaurant with id ${this.restaurant_id} does not exist`));
            }
        }
        next();
    } catch (err: any) {
        next(err);
    }
});

// ─── 8. Model ─────────────────────────────────────────────────────────────────

export const VisitModel = model<IVisit, VisitModelType>('Visit', visitSchema);