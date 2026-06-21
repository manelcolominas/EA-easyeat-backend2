'use strict';
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
exports.softDeleteDocument = softDeleteDocument;
exports.restoreDocument = restoreDocument;
/**
 * Reusable soft-delete helper.
 *
 * Works with **any** Mongoose model that has the shape:
 *   { isActive: boolean; deletedAt: Date | null }
 *
 * Usage (in any service file):
 *   import { softDeleteDocument } from '../utils/softDelete';
 *   await softDeleteDocument(CustomerModel, id);
 *   await softDeleteDocument(EmployeeModel, id);
 */
function softDeleteDocument(Model, id) {
  return __awaiter(this, void 0, void 0, function* () {
    return Model.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
          deletedAt: new Date()
        }
      },
      { new: true } // return the updated document
    );
  });
}
/**
 * Restores a previously soft-deleted document.
 * Useful for admin "undo delete" flows.
 */
function restoreDocument(Model, id) {
  return __awaiter(this, void 0, void 0, function* () {
    return Model.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: true,
          deletedAt: null
        }
      },
      { new: true }
    );
  });
}
//# sourceMappingURL=softDelete.js.map
