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
exports.insertData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logging_1 = __importDefault(require("../library/logging"));
// Import all models
const restaurant_1 = require("../models/restaurant");
const review_1 = require("../models/review");
const customer_1 = require("../models/customer");
const reward_1 = require("../models/reward");
const badge_1 = require("../models/badge");
const visit_1 = require("../models/visit");
const employee_1 = require("../models/employee");
const statistics_1 = require("../models/statistics");
const pointsWallet_1 = require("../models/pointsWallet");
const rewardRedemption_1 = require("../models/rewardRedemption");
const dish_1 = require("../models/dish");
const admin_1 = require("../models/admin");
const dishRating_1 = require("../models/dishRating");
const SALT_ROUNDS = 10;
const modelMap = {
    'restaurants.json': restaurant_1.RestaurantModel,
    'reviews.json': review_1.ReviewModel,
    'customers.json': customer_1.CustomerModel,
    'rewards.json': reward_1.RewardModel,
    'badges.json': badge_1.BadgeModel,
    'visits.json': visit_1.VisitModel,
    'employees.json': employee_1.EmployeeModel,
    'statistics.json': statistics_1.StatisticsModel,
    'pointsWallets.json': pointsWallet_1.PointsWalletModel,
    'rewardRedemptions.json': rewardRedemption_1.RewardRedemptionModel,
    'dishes.json': dish_1.DishModel,
    'admins.json': admin_1.AdminModel,
    'dishRatings.json': dishRating_1.DishRatingModel
};
/**
 * Hashes the password field of every customer record that has one.
 * Returns a new array — the original seed data is not mutated.
 */
const hashCustomerPasswords = (customers) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.all(customers.map((customer) => __awaiter(void 0, void 0, void 0, function* () {
        if (!customer.password)
            return customer;
        const salt = yield bcrypt_1.default.genSalt(SALT_ROUNDS);
        const hashedPassword = yield bcrypt_1.default.hash(customer.password, salt);
        return Object.assign(Object.assign({}, customer), { password: hashedPassword });
    })));
});
const insertData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info('Dropping existing database...');
        yield mongoose_1.default.connection.dropDatabase();
        logging_1.default.info('Database dropped successfully. Recreating and seeding...');
        // Try multiple locations for the data directory
        const possiblePaths = [
            path_1.default.join(__dirname, '../data'), // build/data
            path_1.default.join(process.cwd(), 'src/data'), // src/data (from root)
            path_1.default.join(__dirname, '../../src/data') // src/data (relative to build/utils)
        ];
        let dataDir = '';
        for (const p of possiblePaths) {
            if (fs_1.default.existsSync(p)) {
                dataDir = p;
                break;
            }
        }
        if (!dataDir) {
            logging_1.default.error('Data directory not found. Searched in: ' + possiblePaths.join(', '));
            return;
        }
        logging_1.default.info(`Using data directory: ${dataDir}`);
        const files = fs_1.default.readdirSync(dataDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const model = modelMap[file];
                if (model) {
                    const count = yield model.countDocuments();
                    if (count === 0) {
                        const filePath = path_1.default.join(dataDir, file);
                        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
                        let data = JSON.parse(fileContent);
                        // Hash passwords before seeding customer records
                        if (file === 'customers.json' || file === 'admins.json') {
                            logging_1.default.info(`Hashing passwords for ${file}...`);
                            data = yield hashCustomerPasswords(data);
                        }
                        if (file === 'employees.json') {
                            logging_1.default.info('Hashing employee passwords...');
                            data = yield Promise.all(data.map((emp) => __awaiter(void 0, void 0, void 0, function* () {
                                var _a;
                                if (!((_a = emp.profile) === null || _a === void 0 ? void 0 : _a.password))
                                    return emp;
                                const salt = yield bcrypt_1.default.genSalt(SALT_ROUNDS);
                                return Object.assign(Object.assign({}, emp), { profile: Object.assign(Object.assign({}, emp.profile), { password: yield bcrypt_1.default.hash(emp.profile.password, salt) }) });
                            })));
                        }
                        logging_1.default.info(`Inserting data into ${model.collection.name} collection...`);
                        yield model.insertMany(data);
                        logging_1.default.info(`Data inserted into ${model.collection.name} collection.`);
                    }
                    else {
                        logging_1.default.info(`${model.collection.name} collection is not empty. Skipping insertion.`);
                    }
                }
            }
        }
        logging_1.default.info('Database data check completed.');
        // 1. Get all unique dish IDs that have ratings
        const ratedDishes = yield dishRating_1.DishRatingModel.distinct('dish_id', { deletedAt: null });
        logging_1.default.info(`Recalculating avgRating for ${ratedDishes.length} dishes...`);
        // 2. Trigger the static method for each dish
        // Note: We use Promise.all to run these in parallel for speed
        yield Promise.all(ratedDishes.map((dishId) => dishRating_1.DishRatingModel.calculateAvgRating(dishId)));
        logging_1.default.info('Dish avgRatings updated successfully.');
    }
    catch (error) {
        logging_1.default.error('Error inserting data:');
        logging_1.default.error(error);
        throw error;
    }
});
exports.insertData = insertData;
//# sourceMappingURL=dataSeeder.js.map