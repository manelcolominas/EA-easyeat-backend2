import mongoose from 'mongoose';
import { IVisit, VisitModel } from '../models/visit';
import { PointsWalletModel } from '../models/pointsWallet';
import { RestaurantModel } from '../models/restaurant';

const calculatePointsExponential = (ownMoney90Days: number, otherMoney90Days: number, billAmount: number, meanMoneySpent90Days: number, maxPointsVisit: number): number => {
  // Si encara no hi ha prou dades de visites (mitjana de despesa és 0), assignem un 15% del màxim
  if (meanMoneySpent90Days <= 0) {
    return Math.floor(maxPointsVisit * 0.35);
  }

  const moneySpent = ownMoney90Days * 0.375 + otherMoney90Days * 0.125 + billAmount * 0.5;
  const ratio = moneySpent / meanMoneySpent90Days;
  const transformed = 1 - Math.exp(-ratio);
  const pointsToAssign = Math.floor(transformed * maxPointsVisit);
  return pointsToAssign;
};

const calculateTotalSpentInTheRestaurantLasts90Days = async (customer_id: mongoose.Types.ObjectId, restaurant_id: mongoose.Types.ObjectId): Promise<number> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await VisitModel.aggregate([
    {
      $match: {
        customer_id: new mongoose.Types.ObjectId(customer_id.toString()),
        restaurant_id: new mongoose.Types.ObjectId(restaurant_id.toString()),
        date: { $gte: ninetyDaysAgo },
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$billAmount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalSpent : 0;
};

const calculateTotalSpentInOthersRestaurantsLasts90Days = async (customer_id: mongoose.Types.ObjectId, restaurant_id: mongoose.Types.ObjectId): Promise<number> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await VisitModel.aggregate([
    {
      $match: {
        customer_id: new mongoose.Types.ObjectId(customer_id.toString()),
        restaurant_id: { $ne: new mongoose.Types.ObjectId(restaurant_id.toString()) },
        date: { $gte: ninetyDaysAgo },
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$billAmount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalSpent : 0;
};

const calculateAverageSpentInARestaurantLast90DaysByTheCustomers = async (restaurant_id: mongoose.Types.ObjectId): Promise<number> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await VisitModel.aggregate([
    {
      $match: {
        restaurant_id: new mongoose.Types.ObjectId(restaurant_id.toString()),
        date: { $gte: ninetyDaysAgo },
        deletedAt: null
      }
    },
    {
      $group: {
        _id: '$customer_id',
        totalPerCustomer: { $sum: '$billAmount' }
      }
    },
    {
      $group: {
        _id: null,
        avgSpent: { $avg: '$totalPerCustomer' }
      }
    }
  ]);

  return result.length > 0 ? result[0].avgSpent : 0;
};

const calculateAverageSpentInARestaurantLast90DaysByVisits = async (restaurant_id: mongoose.Types.ObjectId): Promise<number> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await VisitModel.aggregate([
    {
      $match: {
        restaurant_id: new mongoose.Types.ObjectId(restaurant_id.toString()),
        date: { $gte: ninetyDaysAgo },
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        avgSpent: { $avg: '$billAmount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].avgSpent : 0;
};

const pointsRedemption = async (data: Partial<IVisit>) => {
  const { customer_id, restaurant_id, billAmount } = data;

  if (!customer_id || !restaurant_id) {
    throw new Error('customer_id and restaurant_id are required');
  }

  const [totalSpentInTheRestaurantLast90Days, totalSpentInOthersRestaurantsLast90Days, averageSpentInARestaurantLast90DaysByTheCustomers, restaurant] = await Promise.all([
    calculateTotalSpentInTheRestaurantLasts90Days(customer_id, restaurant_id),
    calculateTotalSpentInOthersRestaurantsLasts90Days(customer_id, restaurant_id),
    calculateAverageSpentInARestaurantLast90DaysByTheCustomers(restaurant_id),
    RestaurantModel.findById(restaurant_id)
  ]);

  if (!restaurant) {
    throw new Error(`Restaurant not found for id: ${restaurant_id}`);
  }

  const pointsSystem = restaurant.profile.pointsSystem || {
    method: 'exponential',
    pointsPerEuro: 10,
    maxPointsVisit: restaurant.profile.maxPointsVisit || 500
  };

  let pointsToAssign = 0;

  if (pointsSystem.method === 'simple') {
    pointsToAssign = Math.floor((billAmount ?? 0) * (pointsSystem.pointsPerEuro || 10));
  } else {
    const maxPointsVisit = pointsSystem.maxPointsVisit || restaurant.profile.maxPointsVisit || 500;
    pointsToAssign = calculatePointsExponential(
      totalSpentInTheRestaurantLast90Days,
      totalSpentInOthersRestaurantsLast90Days,
      billAmount ?? 0,
      averageSpentInARestaurantLast90DaysByTheCustomers,
      maxPointsVisit
    );
  }

  const visit = new VisitModel({
    _id: new mongoose.Types.ObjectId(),
    ...data,
    pointsEarned: pointsToAssign
  });

  const savedVisit = await visit.save();

  await PointsWalletModel.findOneAndUpdate({ customer_id, restaurant_id }, { $inc: { points: pointsToAssign } }, { upsert: true, new: true });

  return savedVisit;
};

export { pointsRedemption };
