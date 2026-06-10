import { Schema, model, Types, Model, QueryWithHelpers, HydratedDocument } from 'mongoose';

// ─── Types i Enums ────────────────────────────────────────────────────────────

export type NotificationType = 'points_expiring' | 'new_reward' | 'new_dish' | 'reactivation_offer' | 'promotion' | 'new_message' | 'review_liked' | 'points_awarded';

// ─── Interface ─────────────────────────────────────────────────────────────────

export interface INotification {
  _id?: Types.ObjectId;

  // Destinatari
  customer_id: Types.ObjectId;

  // Opcional: restaurant relacionat (per alguns tipus de notificacions)
  restaurant_id?: Types.ObjectId | null;

  // Informació de la notificació
  type: NotificationType;
  title: string;
  message: string;
  description?: string;

  // Metadades / contexte específic del tipus
  data?: {
    points_expiring_count?: number;
    expiry_date?: Date;
    reward_id?: Types.ObjectId;
    dish_id?: Types.ObjectId;
    review_id?: Types.ObjectId;
    conversation_id?: Types.ObjectId;
    message_id?: Types.ObjectId;
    points_amount?: number;
  };

  // Estat de lectura
  isRead: boolean;
  readAt?: Date | null;

  // État d'enviament (per a FCM)
  fcmSent: boolean;
  fcmSentAt?: Date | null;
  fcmError?: string | null;

  // Soft-delete
  deletedAt?: Date | null;

  // Timestamps automàtics
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

export interface INotificationQueryHelpers {
  active<TResult>(this: QueryWithHelpers<TResult, HydratedDocument<INotification>, INotificationQueryHelpers>): QueryWithHelpers<TResult, HydratedDocument<INotification>, INotificationQueryHelpers>;
  unread<TResult>(this: QueryWithHelpers<TResult, HydratedDocument<INotification>, INotificationQueryHelpers>): QueryWithHelpers<TResult, HydratedDocument<INotification>, INotificationQueryHelpers>;
}

// ─── Model Type ───────────────────────────────────────────────────────────────

type NotificationModelType = Model<INotification, INotificationQueryHelpers>;

// ─── Schema ────────────────────────────────────────────────────────────────────

const notificationSchema = new Schema<INotification, NotificationModelType, {}, INotificationQueryHelpers>(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'customer_id is required'],
      index: true
    },

    restaurant_id: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
      index: true
    },

    type: {
      type: String,
      enum: ['points_expiring', 'new_reward', 'new_dish', 'reactivation_offer', 'promotion', 'new_message', 'review_liked', 'points_awarded'],
      required: [true, 'type is required'],
      index: true
    },

    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    data: {
      type: Schema.Types.Mixed,
      default: {}
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date,
      default: null
    },

    fcmSent: {
      type: Boolean,
      default: false,
      index: true
    },

    fcmSentAt: {
      type: Date,
      default: null
    },

    fcmError: {
      type: String,
      default: null
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Índex per trobar notificacions actives d'un client
notificationSchema.index({ customer_id: 1, deletedAt: 1 });

// Índex per trobar notificacions no llegides
notificationSchema.index({ customer_id: 1, isRead: 1, deletedAt: 1 });

// Índex per trobar notificacions per restaurant i client
notificationSchema.index({ restaurant_id: 1, customer_id: 1, deletedAt: 1 });

// Índex per trobar notificacions per tipus
notificationSchema.index({ type: 1, deletedAt: 1 });

// Índex per ordenar per data
notificationSchema.index({ createdAt: -1, customer_id: 1 });

// Índex per a les no enviades per FCM
notificationSchema.index({ fcmSent: 1, deletedAt: 1 });

// ─── Query Helpers ────────────────────────────────────────────────────────────

notificationSchema.query.active = function <TResult>(this: QueryWithHelpers<TResult, HydratedDocument<INotification>, INotificationQueryHelpers>) {
  return this.where({ deletedAt: null });
};

notificationSchema.query.unread = function <TResult>(this: QueryWithHelpers<TResult, HydratedDocument<INotification>, INotificationQueryHelpers>) {
  return this.where({ isRead: false, deletedAt: null });
};

// ─── Pre-save: Validar relacions ──────────────────────────────────────────────

notificationSchema.pre('save', async function (next) {
  try {
    const { CustomerModel } = await import('./customer');

    if (this.isModified('customer_id') || this.isNew) {
      const customerExists = await CustomerModel.exists({ _id: this.customer_id });
      if (!customerExists) {
        return next(new Error(`Customer with id ${this.customer_id} does not exist`));
      }
    }

    if ((this.isModified('restaurant_id') || this.isNew) && this.restaurant_id) {
      const { RestaurantModel } = await import('./restaurant');
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

// ─── Model ────────────────────────────────────────────────────────────────────

export const NotificationModel = model<INotification, NotificationModelType>('Notification', notificationSchema);
