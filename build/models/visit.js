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
exports.VisitModel = void 0;
const mongoose_1 = require('mongoose');
const employee_1 = require('./employee');
// ─── 4. Schema ────────────────────────────────────────────────────────────────
const visitSchema = new mongoose_1.Schema(
  {
    customer_id: {
      type: mongoose_1.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'customer_id is required']
    },
    restaurant_id: {
      type: mongoose_1.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'restaurant_id is required']
    },
    employee_id: {
      type: mongoose_1.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'employee_id is required']
    },
    date: { type: Date, default: Date.now, required: true },
    pointsEarned: { type: Number, min: [0, 'pointsEarned must be ≥ 0'], default: 0 },
    billAmount: { type: Number, min: [0, 'billAmount must be ≥ 0'], default: 0 },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    versionKey: false
  }
);
// ─── 5. Indexes ───────────────────────────────────────────────────────────────
visitSchema.index({ date: -1 });
visitSchema.index({ employee_id: 1, restaurant_id: 1, deletedAt: 1 });
visitSchema.index({ customer_id: 1, restaurant_id: 1, deletedAt: 1 });
// ─── 6. Query helper — .active() ─────────────────────────────────────────────
visitSchema.query.active = function () {
  return this.where({ deletedAt: null });
};
// ─── 7. Pre-save relational validation ───────────────────────────────────────
visitSchema.pre('save', function (next) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const { CustomerModel } = yield Promise.resolve().then(() => __importStar(require('./customer')));
      const { RestaurantModel } = yield Promise.resolve().then(() => __importStar(require('./restaurant')));
      if (this.isModified('customer_id') || this.isNew) {
        const customerExists = yield CustomerModel.exists({ _id: this.customer_id });
        if (!customerExists) {
          return next(new Error(`Customer with id ${this.customer_id} does not exist`));
        }
      }
      if (this.isModified('restaurant_id') || this.isNew) {
        const restaurantExists = yield RestaurantModel.exists({ _id: this.restaurant_id });
        if (!restaurantExists) {
          return next(new Error(`Restaurant with id ${this.restaurant_id} does not exist`));
        }
      }
      if (this.isModified('employee_id') || this.isNew) {
        const employeeExists = yield employee_1.EmployeeModel.exists({ _id: this.employee_id });
        if (!employeeExists) {
          return next(new Error(`Employee with id ${this.employee_id} does not exist`));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  });
});
// ─── 8. Model ─────────────────────────────────────────────────────────────────
exports.VisitModel = (0, mongoose_1.model)('Visit', visitSchema);
//# sourceMappingURL=visit.js.map
