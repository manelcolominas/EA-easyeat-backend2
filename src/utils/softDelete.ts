import { Model, Types } from 'mongoose';

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
export async function softDeleteDocument<T>(Model: Model<T>, id: string | Types.ObjectId): Promise<T | null> {
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
}

/**
 * Restores a previously soft-deleted document.
 * Useful for admin "undo delete" flows.
 */
export async function restoreDocument<T>(Model: Model<T>, id: string | Types.ObjectId): Promise<T | null> {
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
}
