import { RestaurantModel, IRestaurant } from '../models/restaurant';
import { DishModel, IDish } from '../models/dish';
import { getCurrentServicePeriods, isRestaurantOpenNow } from './servicePeriod'; // Corrected import path

export interface CustomerPreferences {
  dietaryFlags?: string[];
  flavorProfile?: string[];
}

export async function getRecommendedDishes(preferences: CustomerPreferences): Promise<IDish[]> {
  const now = new Date();
  const activePeriods = getCurrentServicePeriods(now);

  // 1. Find restaurants that are open right now
  const restaurants = await RestaurantModel.find({});
  // Filter in memory for simplicity, though this might be optimized later
  const openRestaurants = restaurants.filter((r) => r.profile && r.profile.timetable && isRestaurantOpenNow(r.profile.timetable, now));
  const openIds = openRestaurants.map((r) => r._id);

  // 2. Build query for dishes
  const query: any = {
    restaurant_id: { $in: openIds },
    active: true,
    availableAt: { $in: activePeriods }
  };

  if (preferences.dietaryFlags && preferences.dietaryFlags.length > 0) {
    query.dietaryFlags = { $in: preferences.dietaryFlags };
  }

  if (preferences.flavorProfile && preferences.flavorProfile.length > 0) {
    query.flavorProfile = { $in: preferences.flavorProfile };
  }

  // 3. Find dishes that match the customer taste AND are served right now
  const dishes = await DishModel.find(query).populate('restaurant_id', 'profile.name profile.location profile.globalRating');

  return dishes;
}
