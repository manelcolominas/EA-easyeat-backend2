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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const employee_1 = __importDefault(require('../services/employee'));
const pagination_1 = require('../utils/pagination');
const createEmployee = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employee = yield employee_1.default.createEmployee(req.body);
      return res.status(201).json(employee);
    } catch (error) {
      return res.status(400).json({ message: error.message || 'Error creating employee' });
    }
  });
const readEmployee = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employee = yield employee_1.default.getEmployee(req.params.employee_id);
      return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
    } catch (_a) {
      return res.status(500).json({ message: 'Error fetching employee' });
    }
  });
const readDeletedEmployee = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employee = yield employee_1.default.getDeletedEmployee(req.params.employee_id);
      return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
    } catch (_a) {
      return res.status(500).json({ message: 'Error fetching deleted employee' });
    }
  });
const readAll = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { employees, total } = yield employee_1.default.getAllEmployees(skip, limit);
      return res.status(200).json({
        data: employees,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (_a) {
      return res.status(500).json({ message: 'Error fetching employees' });
    }
  });
const readAllDeleted = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { employees, total } = yield employee_1.default.getAllDeletedEmployees(skip, limit);
      return res.status(200).json({
        data: employees,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (_a) {
      return res.status(500).json({ message: 'Error fetching deleted employees' });
    }
  });
const readByRestaurant = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { restaurant_id } = req.params;
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { employees, total } = yield employee_1.default.getByRestaurant(restaurant_id, skip, limit);
      return res.status(200).json({
        data: employees,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (_a) {
      return res.status(500).json({ message: 'Error fetching employees by restaurant' });
    }
  });
const readDeletedByRestaurant = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { restaurant_id } = req.params;
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { employees, total } = yield employee_1.default.getDeletedByRestaurant(restaurant_id, skip, limit);
      return res.status(200).json({
        data: employees,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (_a) {
      return res.status(500).json({ message: 'Error fetching deleted employees' });
    }
  });
const getEmployeesByRestaurantStats = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { restaurant_id } = req.params;
      const employees = yield employee_1.default.getByRestaurantWithStats(restaurant_id);
      return res.status(200).json(employees);
    } catch (_a) {
      return res.status(500).json({ message: 'Error fetching employees with stats' });
    }
  });
const updateEmployee = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employee = yield employee_1.default.updateEmployee(req.params.employee_id, req.body);
      return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
    } catch (_a) {
      return res.status(500).json({ message: 'Error updating employee' });
    }
  });
const softDeleteEmployee = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employee = yield employee_1.default.softDeleteEmployee(req.params.employee_id);
      return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
    } catch (_a) {
      return res.status(500).json({ message: 'Error deleting employee' });
    }
  });
const restoreEmployee = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employee = yield employee_1.default.restoreEmployee(req.params.employee_id);
      return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
    } catch (_a) {
      return res.status(500).json({ message: 'Error restoring employee' });
    }
  });
const hardDeleteEmployee = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const employee = yield employee_1.default.hardDeleteEmployee(req.params.employee_id);
      return employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' });
    } catch (_a) {
      return res.status(500).json({ message: 'Error permanently deleting employee' });
    }
  });
exports.default = {
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
//# sourceMappingURL=employee.js.map
