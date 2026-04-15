import mongoose from 'mongoose';
import { StatisticsModel, IStatistics } from '../models/statistics';
import { VisitModel } from '../models/visit';
import { ReviewModel } from '../models/review';

//Cards de KPIs per restaurant 

const getRestaurantKpis = async (restaurantId: string) => {
  const data = await StatisticsModel.findOne(
    { restaurant_id: new mongoose.Types.ObjectId(restaurantId) },
    {
      totalPointsGiven: 1,
      loyalCustomers: 1,
      averagePointsPerVisit: 1,
      _id: 0
    }
  ).lean();

  return data || {
    totalPointsGiven: 0,
    loyalCustomers: 0,
    averagePointsPerVisit: 0
  };
};
// A quina hora van els clients
export const getVisitsPerHour = async () => {
const data = await VisitModel.aggregate([

    // Filtramos solo documentos válidos 
    {
      $match: {
        $or: [
          { deletedAt: null },           // documentos activos
          { deletedAt: { $exists: false } } // documentos sin campo (seed antiguo)
        ]
      }
    },

    // Agrupamos por hora del campo "date"
    {
      $group: {
        _id: { $hour: "$date" }, // extrae la hora (0–23)
        total: { $sum: 1 }       // cuenta cuántas visitas hay en esa hora
      }
    },

    // Renombramos campos para frontend 
    {
      $project: {
        hour: "$_id", // _id pasa a ser "hour"
        total: 1,
        _id: 0        // eliminamos _id
      }
    },

    //Ordenamos por hora (importante para gráfica)
    { $sort: { hour: 1 } }
  ]);

  //Creamos array SOLO de horas útiles (10 → 23)
  const usefulHours = Array.from({ length: 14 }, (_, i) => ({
    hour: i + 10, // empieza en 10
    total: 0      // por defecto sin visitas
  }));

  // Reemplazamos con datos reales si existen
  data.forEach(d => {
    if (d.hour >= 10 && d.hour <= 23) {
      usefulHours[d.hour - 10] = d;
    }
  });

  // Devolvemos array listo para frontend
  return usefulHours;
};

//BarChart de ratings (foodQuality, staffService, cleanliness, environment) per restaurant 
export const getAverageRatingsByRestaurant = async (restaurantId: string) => {
  return await ReviewModel.aggregate([
    {
      $match: {
        restaurant_id: new mongoose.Types.ObjectId(restaurantId),
        deletedAt: null,
        deleted: { $ne: true }
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
};

export default { getVisitsPerHour, getAverageRatingsByRestaurant, getRestaurantKpis };
