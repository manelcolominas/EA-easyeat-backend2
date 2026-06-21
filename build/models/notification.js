'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            }
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require('mongoose');
// ─── Schema ────────────────────────────────────────────────────────────────────
const notificationSchema = new mongoose_1.Schema(
  {
    customer_id: {
      type: mongoose_1.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'customer_id is required'],
      index: true
    },
    restaurant_id: {
      type: mongoose_1.Schema.Types.ObjectId,
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
      type: mongoose_1.Schema.Types.Mixed,
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
notificationSchema.query.active = function () {
  return this.where({ deletedAt: null });
};
notificationSchema.query.unread = function () {
  return this.where({ isRead: false, deletedAt: null });
};
// ─── Pre-save: Validar relacions ──────────────────────────────────────────────
notificationSchema.pre('save', function (next) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const { CustomerModel } = yield Promise.resolve().then(() => __importStar(require('./customer')));
      if (this.isModified('customer_id') || this.isNew) {
        const customerExists = yield CustomerModel.exists({ _id: this.customer_id });
        if (!customerExists) {
          return next(new Error(`Customer with id ${this.customer_id} does not exist`));
        }
      }
      if ((this.isModified('restaurant_id') || this.isNew) && this.restaurant_id) {
        const { RestaurantModel } = yield Promise.resolve().then(() => __importStar(require('./restaurant')));
        const restaurantExists = yield RestaurantModel.exists({ _id: this.restaurant_id });
        if (!restaurantExists) {
          return next(new Error(`Restaurant with id ${this.restaurant_id} does not exist`));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  });
});
// ─── Model ────────────────────────────────────────────────────────────────────
exports.NotificationModel = (0, mongoose_1.model)('Notification', notificationSchema);
//# sourceMappingURL=notification.js.map
