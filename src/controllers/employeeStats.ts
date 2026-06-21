import { NextFunction, Request, Response } from 'express';
import EmployeeStatsService from '../services/employeeStats';

const getEmployeeStatistics = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { employee_id } = req.params;
  try {
    // Try to get existing stats
    let employeeStats = await EmployeeStatsService.getEmployeeStatistics(employee_id);

    // If stats don't exist, calculate and save them
    if (!employeeStats) {
      employeeStats = await EmployeeStatsService.calculateAndSaveEmployeeStatistics(employee_id);
    }

    return res.status(200).json(employeeStats);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const calculateAndSaveEmployeeStatistics = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { employee_id } = req.params;
  try {
    const stats = await EmployeeStatsService.calculateAndSaveEmployeeStatistics(employee_id);
    return res.status(200).json({
      message: 'Employee statistics calculated and saved successfully',
      data: stats
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const recalculateEmployeeStatistics = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { employee_id } = req.params;
  try {
    const stats = await EmployeeStatsService.calculateAndSaveEmployeeStatistics(employee_id);
    return res.status(200).json({
      message: 'Employee statistics recalculated successfully',
      data: stats
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export default {
  getEmployeeStatistics,
  calculateAndSaveEmployeeStatistics,
  recalculateEmployeeStatistics
};
