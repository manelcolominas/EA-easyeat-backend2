import { Schema, model, Types } from 'mongoose';

export interface IEmployeeStats {
  _id?: Types.ObjectId;
  employee_id: Types.ObjectId;
  totalVisitsHandled: number;
  totalCustomersServed: number;
  totalRevenueGenerated: number;
  totalRewardApprovalsRejections: number;
  totalRewardApprovalsApproved: number;
  totalRewardApprovalsRejected: number;
  averageRewardApprovalTime: number; // in minutes
}

const employeeStatsSchema = new Schema<IEmployeeStats>(
  {
    employee_id: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    totalVisitsHandled: { type: Number, default: 0 },
    totalCustomersServed: { type: Number, default: 0 },
    totalRevenueGenerated: { type: Number, default: 0 },
    totalRewardApprovalsRejections: { type: Number, default: 0 },
    totalRewardApprovalsApproved: { type: Number, default: 0 },
    totalRewardApprovalsRejected: { type: Number, default: 0 },
    averageRewardApprovalTime: { type: Number, default: 0 }
  },
  { timestamps: true }
);

employeeStatsSchema.index({ employee_id: 1 }, { unique: true });

export const EmployeeStatsModel = model<IEmployeeStats>('EmployeeStats', employeeStatsSchema);
