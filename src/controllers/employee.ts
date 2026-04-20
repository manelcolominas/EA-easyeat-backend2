import { NextFunction, Request, Response } from 'express';
import EmployeeService from '../services/employee';
import { getPaginationOptions } from '../utils/pagination';

const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedEmployee = await EmployeeService.createEmployee(req.body);
        return res.status(201).json(savedEmployee);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { employee_id } = req.params;
    try {
        const employee = await EmployeeService.getEmployee(employee_id);
        return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readDeletedEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { employee_id } = req.params;
    try {
        const employee = await EmployeeService.getDeletedEmployee(employee_id);
        return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { employees, total } = await EmployeeService.getAllEmployees(skip,limit);
        return res.status(200).json({
            data: employees,
            meta: { total: total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllDeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req.query);
        const { employees, total } = await EmployeeService.getAllDeletedEmployees(skip,limit);
        return res.status(200).json({
            data: employees,
            meta: { total: total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { employee_id } = req.params;
    try {
        const updatedEmployee = await EmployeeService.updateEmployee(employee_id, req.body);
        return updatedEmployee ? res.status(201).json(updatedEmployee) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const softDeleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { employee_id } = req.params;
    try {
        const employee = await EmployeeService.softDeleteEmployee(employee_id);
        return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const restoreEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { employee_id } = req.params;
    try {
        const employee = await EmployeeService.restoreEmployee(employee_id);
        return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const hardDeleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { employee_id } = req.params;
    try {
        const employee = await EmployeeService.hardDeleteEmployee(employee_id);
        return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createEmployee,
    readEmployee,
    readDeletedEmployee,
    readAll,
    readAllDeleted,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    hardDeleteEmployee
};
