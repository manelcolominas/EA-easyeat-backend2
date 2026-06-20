"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const employee_1 = require("../models/employee");
const restaurant_1 = require("../models/restaurant");
const review_1 = require("../models/review");
const visit_1 = require("../models/visit");
const createEmployee = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = data.profile) === null || _a === void 0 ? void 0 : _a.email)) {
        throw new Error('Email is required');
    }
    if (!data.restaurant_id) {
        throw new Error('Restaurant ID is required');
    }
    const existing = yield employee_1.EmployeeModel.findOne({
        'profile.email': data.profile.email,
        restaurant_id: data.restaurant_id,
        isActive: true
    });
    if (existing) {
        throw new Error('Employee already exists in this restaurant');
    }
    const employee = new employee_1.EmployeeModel(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, data));
    const savedEmployee = yield employee.save();
    yield restaurant_1.RestaurantModel.findByIdAndUpdate(data.restaurant_id, {
        $addToSet: { employees: savedEmployee._id }
    });
    return savedEmployee;
});
const getEmployee = (employee_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield employee_1.EmployeeModel.findById(employee_id).select('-profile.password');
});
const getDeletedEmployee = (employee_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield employee_1.EmployeeModel.findOne({ _id: employee_id, isActive: false }).select('-profile.password');
});
const getAllEmployees = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [employees, total] = yield Promise.all([
        employee_1.EmployeeModel.find({ isActive: true }).select('-profile.password').skip(skip).limit(limit).lean(),
        employee_1.EmployeeModel.countDocuments({ isActive: true })
    ]);
    return { employees, total };
});
const getAllDeletedEmployees = (skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [employees, total] = yield Promise.all([
        employee_1.EmployeeModel.find({ isActive: false }).select('-profile.password').skip(skip).limit(limit).lean(),
        employee_1.EmployeeModel.countDocuments({ isActive: false })
    ]);
    return { employees, total };
});
const getByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id),
        isActive: true
    };
    const [employees, total] = yield Promise.all([employee_1.EmployeeModel.find(query).select('-profile.password').skip(skip).limit(limit).lean(), employee_1.EmployeeModel.countDocuments(query)]);
    return { employees, total };
});
const getDeletedByRestaurant = (restaurant_id, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        restaurant_id: new mongoose_1.default.Types.ObjectId(restaurant_id),
        isActive: false
    };
    const [employees, total] = yield Promise.all([employee_1.EmployeeModel.find(query).select('-profile.password').skip(skip).limit(limit).lean(), employee_1.EmployeeModel.countDocuments(query)]);
    return { employees, total };
});
const getByRestaurantWithStats = (restaurant_id) => __awaiter(void 0, void 0, void 0, function* () {
    const restaurantObjectId = new mongoose_1.default.Types.ObjectId(restaurant_id);
    const employees = yield employee_1.EmployeeModel.find({ restaurant_id: restaurantObjectId, isActive: true }).select('-profile.password').lean();
    const employeeIds = employees.map((employee) => employee._id).filter((employeeId) => Boolean(employeeId));
    if (!employeeIds.length) {
        return employees.map((employee) => (Object.assign(Object.assign({}, employee), { active: employee.isActive, stats: {
                averageRating: null,
                totalVisits: 0,
                revenue: 0
            } })));
    }
    const [visitsStats, reviewsStats] = yield Promise.all([
        visit_1.VisitModel.aggregate([
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
        review_1.ReviewModel.aggregate([
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
    const visitsMap = new Map(visitsStats.map((item) => [String(item._id), { totalVisits: item.totalVisits, revenue: item.revenue }]));
    const reviewsMap = new Map(reviewsStats.map((item) => [String(item._id), { averageRating: item.averageRating }]));
    return employees.map((employee) => {
        var _a, _b, _c;
        const visitStats = visitsMap.get(String(employee._id));
        const reviewStats = reviewsMap.get(String(employee._id));
        const statsObj = {
            averageRating: (_a = reviewStats === null || reviewStats === void 0 ? void 0 : reviewStats.averageRating) !== null && _a !== void 0 ? _a : null,
            totalVisits: (_b = visitStats === null || visitStats === void 0 ? void 0 : visitStats.totalVisits) !== null && _b !== void 0 ? _b : 0,
            revenue: (_c = visitStats === null || visitStats === void 0 ? void 0 : visitStats.revenue) !== null && _c !== void 0 ? _c : 0
        };
        return Object.assign(Object.assign({}, employee), { active: employee.isActive, stats: statsObj });
    });
});
const updateEmployee = (employee_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const employee = yield employee_1.EmployeeModel.findById(employee_id);
    if (!employee)
        return null;
    if ((_a = data.profile) === null || _a === void 0 ? void 0 : _a.name) {
        employee.profile.name = data.profile.name;
    }
    if ((_b = data.profile) === null || _b === void 0 ? void 0 : _b.role) {
        employee.profile.role = data.profile.role;
    }
    if ((_c = data.profile) === null || _c === void 0 ? void 0 : _c.phone) {
        employee.profile.phone = data.profile.phone;
    }
    if ((_d = data.profile) === null || _d === void 0 ? void 0 : _d.email) {
        employee.profile.email = data.profile.email;
    }
    return yield employee.save();
});
const softDeleteEmployee = (employee_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield employee_1.EmployeeModel.findByIdAndUpdate(employee_id, { isActive: false }, { new: true }).select('-profile.password');
});
const restoreEmployee = (employee_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield employee_1.EmployeeModel.findByIdAndUpdate(employee_id, { isActive: true }, { new: true }).select('-profile.password');
});
const hardDeleteEmployee = (employee_id) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedEmployee = yield employee_1.EmployeeModel.findByIdAndDelete(employee_id);
    if (deletedEmployee === null || deletedEmployee === void 0 ? void 0 : deletedEmployee.restaurant_id) {
        yield restaurant_1.RestaurantModel.findByIdAndUpdate(deletedEmployee.restaurant_id, {
            $pull: { employees: deletedEmployee._id }
        });
    }
    return deletedEmployee;
});
exports.default = {
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
//# sourceMappingURL=employee.js.map