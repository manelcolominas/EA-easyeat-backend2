import mongoose from 'mongoose';
import { EmployeeModel, IEmployee } from '../models/employee';
import { RestaurantModel } from '../models/restaurant';
import { ReviewModel } from '../models/review';
import { VisitModel } from '../models/visit';

type EmployeeStatsResult = IEmployee & {
  active?: boolean;
  stats?: {
    averageRating: number | null;
    totalVisits: number;
    revenue: number;
  };
};

const createEmployee = async (data: Partial<IEmployee>) => {
  if (!data.profile?.email) {
    throw new Error('Email is required');
  }

  if (!data.restaurant_id) {
    throw new Error('Restaurant ID is required');
  }

  const existing = await EmployeeModel.findOne({
    'profile.email': data.profile.email,
    restaurant_id: data.restaurant_id,
    isActive: true
  });

  if (existing) {
    throw new Error('Employee already exists in this restaurant');
  }

  const employee = new EmployeeModel({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });

  const savedEmployee = await employee.save();

  await RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
    $addToSet: { employees: savedEmployee._id }
  });

  return savedEmployee;
};

const getEmployee = async (employee_id: string) => {
  return await EmployeeModel.findById(employee_id).select('-profile.password');
};

const getDeletedEmployee = async (employee_id: string) => {
  return await EmployeeModel.findOne({ _id: employee_id, isActive: false }).select('-profile.password');
};

const getAllEmployees = async (skip: number, limit: number): Promise<{ employees: IEmployee[]; total: number }> => {
  const [employees, total] = await Promise.all([
    EmployeeModel.find({ isActive: true }).select('-profile.password').skip(skip).limit(limit).lean<IEmployee[]>(),
    EmployeeModel.countDocuments({ isActive: true })
  ]);

  return { employees, total };
};

const getAllDeletedEmployees = async (skip: number, limit: number): Promise<{ employees: IEmployee[]; total: number }> => {
  const [employees, total] = await Promise.all([
    EmployeeModel.find({ isActive: false }).select('-profile.password').skip(skip).limit(limit).lean<IEmployee[]>(),
    EmployeeModel.countDocuments({ isActive: false })
  ]);

  return { employees, total };
};

const getByRestaurant = async (restaurant_id: string, skip: number, limit: number) => {
  const query = {
    restaurant_id: new mongoose.Types.ObjectId(restaurant_id),
    isActive: true
  };

  const [employees, total] = await Promise.all([EmployeeModel.find(query).select('-profile.password').skip(skip).limit(limit).lean<IEmployee[]>(), EmployeeModel.countDocuments(query)]);

  return { employees, total };
};

const getDeletedByRestaurant = async (restaurant_id: string, skip: number, limit: number) => {
  const query = {
    restaurant_id: new mongoose.Types.ObjectId(restaurant_id),
    isActive: false
  };

  const [employees, total] = await Promise.all([EmployeeModel.find(query).select('-profile.password').skip(skip).limit(limit).lean<IEmployee[]>(), EmployeeModel.countDocuments(query)]);

  return { employees, total };
};

const getByRestaurantWithStats = async (restaurant_id: string): Promise<EmployeeStatsResult[]> => {
  const restaurantObjectId = new mongoose.Types.ObjectId(restaurant_id);

  const employees = await EmployeeModel.find({ restaurant_id: restaurantObjectId, isActive: true }).select('-profile.password').lean<IEmployee[]>();

  const employeeIds = employees.map((employee) => employee._id).filter((employeeId): employeeId is mongoose.Types.ObjectId => Boolean(employeeId));

  if (!employeeIds.length) {
    return employees.map((employee) => ({
      ...employee,
      active: employee.isActive,
      stats: {
        averageRating: null,
        totalVisits: 0,
        revenue: 0
      }
    }));
  }

  const [visitsStats, reviewsStats] = await Promise.all([
    VisitModel.aggregate<{ _id: mongoose.Types.ObjectId; totalVisits: number; revenue: number }>([
      {
        $match: {
          restaurant_id: restaurantObjectId,
          employee_id: { $in: employeeIds },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: '$employee_id',
          totalVisits: { $sum: 1 },
          revenue: { $sum: '$billAmount' }
        }
      }
    ]),
    ReviewModel.aggregate<{ _id: mongoose.Types.ObjectId; averageRating: number | null }>([
      {
        $match: {
          restaurant_id: restaurantObjectId,
          employee_id: { $in: employeeIds },
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$employee_id',
          averageRating: { $avg: '$globalRating' }
        }
      }
    ])
  ]);

  console.log('Stats calculated:', { visitsStats, reviewsStats });

  const visitsMap = new Map<string, { totalVisits: number; revenue: number }>(visitsStats.map((item) => [String(item._id), { totalVisits: item.totalVisits, revenue: item.revenue }]));

  const reviewsMap = new Map<string, { averageRating: number | null }>(reviewsStats.map((item) => [String(item._id), { averageRating: item.averageRating }]));

  return employees.map((employee) => {
    const visitStats = visitsMap.get(String(employee._id));
    const reviewStats = reviewsMap.get(String(employee._id));

    const statsObj = {
      averageRating: reviewStats?.averageRating ?? null,
      totalVisits: visitStats?.totalVisits ?? 0,
      revenue: visitStats?.revenue ?? 0
    };

    return {
      ...employee,
      active: employee.isActive,
      stats: statsObj
    };
  });
};

const updateEmployee = async (employee_id: string, data: Partial<IEmployee>) => {
  const employee = await EmployeeModel.findById(employee_id);

  if (!employee) return null;

  if (data.profile?.name) {
    employee.profile.name = data.profile.name;
  }

  if (data.profile?.role) {
    employee.profile.role = data.profile.role;
  }

  if (data.profile?.phone) {
    employee.profile.phone = data.profile.phone;
  }

  if (data.profile?.email) {
    employee.profile.email = data.profile.email;
  }

  return await employee.save();
};

const softDeleteEmployee = async (employee_id: string) => {
  return await EmployeeModel.findByIdAndUpdate(employee_id, { isActive: false }, { new: true }).select('-profile.password');
};

const restoreEmployee = async (employee_id: string) => {
  return await EmployeeModel.findByIdAndUpdate(employee_id, { isActive: true }, { new: true }).select('-profile.password');
};

const hardDeleteEmployee = async (employee_id: string) => {
  const deletedEmployee = await EmployeeModel.findByIdAndDelete(employee_id);

  if (deletedEmployee?.restaurant_id) {
    await RestaurantModel.findByIdAndUpdate(deletedEmployee.restaurant_id, {
      $pull: { employees: deletedEmployee._id }
    });
  }

  return deletedEmployee;
};

export default {
  createEmployee,
  getEmployee,
  getDeletedEmployee,
  getAllEmployees,
  getAllDeletedEmployees,
  getByRestaurant,
  getDeletedByRestaurant,
  getByRestaurantWithStats,
  updateEmployee,
  softDeleteEmployee,
  restoreEmployee,
  hardDeleteEmployee
};
