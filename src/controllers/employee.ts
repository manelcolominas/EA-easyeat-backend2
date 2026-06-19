import { Request, Response } from 'express';
import EmployeeService from '../services/employee';
import { getPaginationOptions } from '../utils/pagination';

const createEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
    return res.status(201).json(employee);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Error creating employee' });
  }
};

const readEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await EmployeeService.getEmployee(req.params.employee_id);
    return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
  } catch {
    return res.status(500).json({ message: 'Error fetching employee' });
  }
};

const readDeletedEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await EmployeeService.getDeletedEmployee(req.params.employee_id);
    return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
  } catch {
    return res.status(500).json({ message: 'Error fetching deleted employee' });
  }
};

const readAll = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { employees, total } = await EmployeeService.getAllEmployees(skip, limit);

    return res.status(200).json({
      data: employees,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch {
    return res.status(500).json({ message: 'Error fetching employees' });
  }
};

const readAllDeleted = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { employees, total } = await EmployeeService.getAllDeletedEmployees(skip, limit);

    return res.status(200).json({
      data: employees,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch {
    return res.status(500).json({ message: 'Error fetching deleted employees' });
  }
};

const readByRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { restaurant_id } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { employees, total } = await EmployeeService.getByRestaurant(restaurant_id, skip, limit);

    return res.status(200).json({
      data: employees,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch {
    return res.status(500).json({ message: 'Error fetching employees by restaurant' });
  }
};

const readDeletedByRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { restaurant_id } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { employees, total } = await EmployeeService.getDeletedByRestaurant(restaurant_id, skip, limit);

    return res.status(200).json({
      data: employees,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch {
    return res.status(500).json({ message: 'Error fetching deleted employees' });
  }
};

const getEmployeesByRestaurantStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { restaurant_id } = req.params;
    const employees = await EmployeeService.getByRestaurantWithStats(restaurant_id);

    return res.status(200).json(employees);
  } catch {
    return res.status(500).json({ message: 'Error fetching employees with stats' });
  }
};

const updateEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await EmployeeService.updateEmployee(req.params.employee_id, req.body);
    return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
  } catch {
    return res.status(500).json({ message: 'Error updating employee' });
  }
};

const softDeleteEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await EmployeeService.softDeleteEmployee(req.params.employee_id);
    return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
  } catch {
    return res.status(500).json({ message: 'Error deleting employee' });
  }
};

const restoreEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await EmployeeService.restoreEmployee(req.params.employee_id);
    return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
  } catch {
    return res.status(500).json({ message: 'Error restoring employee' });
  }
};

const hardDeleteEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await EmployeeService.hardDeleteEmployee(req.params.employee_id);
    return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
  } catch {
    return res.status(500).json({ message: 'Error permanently deleting employee' });
  }
};

export default {
  createEmployee,
  readEmployee,
  readDeletedEmployee,
  readAll,
  readAllDeleted,
  readByRestaurant,
  readDeletedByRestaurant,
  getEmployeesByRestaurantStats,
  updateEmployee,
  softDeleteEmployee,
  restoreEmployee,
  hardDeleteEmployee
};
