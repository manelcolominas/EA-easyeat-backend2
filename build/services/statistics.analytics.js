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
exports.getAverageRatingsByRestaurant = exports.getVisitsPerHour = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const statistics_1 = require("../models/statistics");
const visit_1 = require("../models/visit");
const review_1 = require("../models/review");
//Cards de KPIs per restaurant 
const getRestaurantKpis = (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield statistics_1.StatisticsModel.findOne({ restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId) }, {
        totalPointsGiven: 1,
        loyalCustomers: 1,
        averagePointsPerVisit: 1,
        _id: 0
    }).lean();
    return data || {
        totalPointsGiven: 0,
        loyalCustomers: 0,
        averagePointsPerVisit: 0
    };
});
// A quina hora van els clients
const getVisitsPerHour = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield visit_1.VisitModel.aggregate([
        // Filtramos solo documentos válidos 
        {
            $match: {
                $or: [
                    { deletedAt: null },
                    { deletedAt: { $exists: false } } // documentos sin campo (seed antiguo)
                ]
            }
        },
        // Agrupamos por hora del campo "date"
        {
            $group: {
                _id: { $hour: "$date" },
                total: { $sum: 1 } // cuenta cuántas visitas hay en esa hora
            }
        },
        // Renombramos campos para frontend 
        {
            $project: {
                hour: "$_id",
                total: 1,
                _id: 0 // eliminamos _id
            }
        },
        //Ordenamos por hora (importante para gráfica)
        { $sort: { hour: 1 } }
    ]);
    //Creamos array SOLO de horas útiles (10 → 23)
    const usefulHours = Array.from({ length: 14 }, (_, i) => ({
        hour: i + 10,
        total: 0 // por defecto sin visitas
    }));
    // Reemplazamos con datos reales si existen
    data.forEach(d => {
        if (d.hour >= 10 && d.hour <= 23) {
            usefulHours[d.hour - 10] = d;
        }
    });
    // Devolvemos array listo para frontend
    return usefulHours;
});
exports.getVisitsPerHour = getVisitsPerHour;
//BarChart de ratings (foodQuality, staffService, cleanliness, environment) per restaurant 
const getAverageRatingsByRestaurant = (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield review_1.ReviewModel.aggregate([
        {
            $match: {
                restaurant_id: new mongoose_1.default.Types.ObjectId(restaurantId),
                deleted: false
            }
        },
        {
            $group: {
                _id: null,
                foodQuality: { $avg: "$foodQuality" },
                staffService: { $avg: "$staffService" },
                cleanliness: { $avg: "$cleanliness" },
                environment: { $avg: "$environment" }
            }
        },
        {
            $project: {
                _id: 0,
                data: [
                    { name: "Food Quality", value: "$foodQuality" },
                    { name: "Staff Service", value: "$staffService" },
                    { name: "Cleanliness", value: "$cleanliness" },
                    { name: "Environment", value: "$environment" }
                ]
            }
        }
    ]);
});
exports.getAverageRatingsByRestaurant = getAverageRatingsByRestaurant;
exports.default = { getVisitsPerHour: exports.getVisitsPerHour, getAverageRatingsByRestaurant: exports.getAverageRatingsByRestaurant, getRestaurantKpis };
