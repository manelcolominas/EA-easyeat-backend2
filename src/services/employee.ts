import mongoose from 'mongoose';
import { EmployeeModel, IEmployee } from '../models/employee';
import { RestaurantModel } from '../models/restaurant';

const createEmployee = async (data: Partial<IEmployee>) => {
    const employee = new EmployeeModel({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });

    const savedEmployee = await employee.save();

    if (data.restaurant_id) {
        await RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
            $push: { employees: savedEmployee._id }
        });
    }

    return savedEmployee;
};

const getEmployee = async (employee_id: string) => {
    return await EmployeeModel.findById(employee_id);
};

const getDeletedEmployee = async (employee_id: string) => {
    return await EmployeeModel.findOne({ _id: employee_id, isActive: false }).lean();
};

const getAllEmployees = async (skip: number, limit: number): Promise<{ employees: IEmployee[], total: number }> => {
    const [employees, total] = await Promise.all([
        EmployeeModel.find({ isActive: true }).lean().skip(skip).limit(limit),
        EmployeeModel.countDocuments({ isActive: true })
    ]);
    return { employees, total };
};

const getAllDeletedEmployees = async (skip: number, limit: number): Promise<{ employees: IEmployee[], total: number }> => {
    const [employees, total] = await Promise.all([
        EmployeeModel.find({ isActive: false }).lean().skip(skip).limit(limit),
        EmployeeModel.countDocuments({ isActive: false })
    ]);
    return { employees, total };
}

const updateEmployee = async (employee_id: string, data: Partial<IEmployee>) => {
    const employee = await EmployeeModel.findById(employee_id);

    if (employee) {
        employee.set(data);
        return await employee.save();
    }

    return null;
};

const softDeleteEmployee = async (employee_id: string) => {
    return await EmployeeModel.findByIdAndUpdate(employee_id, { isActive: false }, { new: true }).lean();
};

const restoreEmployee = async (employee_id: string) => {
    return await EmployeeModel.findByIdAndUpdate(employee_id, { isActive: true }, { new: true }).lean();
};

const hardDeleteEmployee = async (employee_id: string) => {
    const deletedEmployee = await EmployeeModel.findByIdAndDelete(employee_id);

    if (deletedEmployee && deletedEmployee.restaurant_id) {
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
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    hardDeleteEmployee,
};
