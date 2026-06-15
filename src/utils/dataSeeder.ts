import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import Logging from '../library/logging';

// Weaviate imports
import { insertRestaurantVector, insertDishVector, insertReviewVector, insertRewardVector } from '../services/weaviate.service';
import { restaurantToWeaviate, dishToWeaviate, reviewToWeaviate, rewardToWeaviate } from './dataToWeaviateData';
import { initWeaviate } from '../services/weaviate-init.service';
import { getWeaviateClient } from '../config/weaviate';

// Import all models
import { RestaurantModel } from '../models/restaurant';
import { ReviewModel } from '../models/review';
import { CustomerModel } from '../models/customer';
import { RewardModel } from '../models/reward';
import { BadgeModel } from '../models/badge';
import { VisitModel } from '../models/visit';
import { EmployeeModel } from '../models/employee';
import { StatisticsModel } from '../models/statistics';
import { PointsWalletModel } from '../models/pointsWallet';
import { RewardRedemptionModel } from '../models/rewardRedemption';
import { DishModel } from '../models/dish';
import { AdminModel } from '../models/admin';
import { DishRatingModel } from '../models/dishRating';

const SALT_ROUNDS = 10;

const modelMap: { [key: string]: mongoose.Model<any> } = {
  'restaurants.json': RestaurantModel,
  'reviews.json': ReviewModel,
  'customers.json': CustomerModel,
  'rewards.json': RewardModel,
  'badges.json': BadgeModel,
  'visits.json': VisitModel,
  'employees.json': EmployeeModel,
  'statistics.json': StatisticsModel,
  'pointsWallets.json': PointsWalletModel,
  'rewardRedemptions.json': RewardRedemptionModel,
  'dishes.json': DishModel,
  'admins.json': AdminModel,
  'dishRatings.json': DishRatingModel
};

/**
 * Hashes the password field of every customer record that has one.
 * Returns a new array — the original seed data is not mutated.
 */
const hashCustomerPasswords = async (customers: any[]): Promise<any[]> => {
  return Promise.all(
    customers.map(async (customer) => {
      if (!customer.password) return customer;
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(customer.password, salt);
      return { ...customer, password: hashedPassword };
    })
  );
};

export const insertData = async () => {
  try {
    Logging.info('Dropping existing database...');
    await mongoose.connection.dropDatabase();
    Logging.info('Database dropped successfully. Recreating and seeding...');

    try {
      Logging.info('Cleaning Weaviate collections...');
      const weaviateClient = await getWeaviateClient();
      const collectionsToClean = ['Restaurant', 'Dish', 'Review', 'Reward'];
      for (const col of collectionsToClean) {
        try {
          await weaviateClient.collections.delete(col);
          Logging.info(`Deleted Weaviate collection: ${col}`);
        } catch (colError) {
          Logging.warning(`Could not delete Weaviate collection ${col}: ${colError}`);
        }
      }
    } catch (weaviateError) {
      Logging.error('Error connecting to Weaviate or deleting collections:');
      Logging.error(weaviateError);
    }

    await initWeaviate();
    Logging.info('Weaviate collections initialized successfully...');

    // Try multiple locations for the data directory
    const possiblePaths = [
      path.join(__dirname, '../data'), // build/data
      path.join(process.cwd(), 'src/data'), // src/data (from root)
      path.join(__dirname, '../../src/data') // src/data (relative to build/utils)
    ];

    let dataDir = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        dataDir = p;
        break;
      }
    }

    if (!dataDir) {
      Logging.error('Data directory not found. Searched in: ' + possiblePaths.join(', '));
      return;
    }

    Logging.info(`Using data directory: ${dataDir}`);

    const files = fs.readdirSync(dataDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const model = modelMap[file];
        if (model) {
          const count = await model.countDocuments();
          if (count === 0) {
            const filePath = path.join(dataDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            let data = JSON.parse(fileContent);

            // Hash passwords before seeding customer records
            if (file === 'customers.json' || file === 'admins.json') {
              Logging.info(`Hashing passwords for ${file}...`);
              data = await hashCustomerPasswords(data);
            }

            if (file === 'employees.json') {
              Logging.info('Hashing employee passwords...');
              data = await Promise.all(
                data.map(async (emp: any) => {
                  if (!emp.profile?.password) return emp;
                  const salt = await bcrypt.genSalt(SALT_ROUNDS);
                  return { ...emp, profile: { ...emp.profile, password: await bcrypt.hash(emp.profile.password, salt) } };
                })
              );
            }

            Logging.info(`Inserting data into ${model.collection.name} collection...`);
            await model.insertMany(data);
            Logging.info(`Data inserted into ${model.collection.name} collection.`);
          } else {
            Logging.info(`${model.collection.name} collection is not empty. Skipping insertion.`);
          }
        }
      }
    }

    Logging.info('Database data check completed.');

    // 1. Get all unique dish IDs that have ratings
    const ratedDishes = await DishRatingModel.distinct('dish_id', { deletedAt: null });

    Logging.info(`Recalculating avgRating for ${ratedDishes.length} dishes...`);

    // 2. Trigger the static method for each dish
    // Note: We use Promise.all to run these in parallel for speed
    await Promise.all(ratedDishes.map((dishId) => (DishRatingModel as any).calculateAvgRating(dishId)));

    Logging.info('Dish avgRatings updated successfully.');

    // --- Weaviate Seeding Phase ---
    Logging.info('Starting Weaviate seeding phase...');

    // 1. Restaurants
    const restaurants = await RestaurantModel.find({
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
    });
    Logging.info(`Found ${restaurants.length} active restaurants in MongoDB. Seeding to Weaviate...`);
    for (const r of restaurants) {
      try {
        const weaviateData = restaurantToWeaviate(r);
        await insertRestaurantVector(weaviateData);
      } catch (err) {
        Logging.error(`Failed to insert restaurant ${r._id} to Weaviate: ${err}`);
      }
    }

    // 2. Dishes
    const dishes = await DishModel.find({
      $and: [{ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }, { $or: [{ deleted: { $ne: true } }] }]
    });
    Logging.info(`Found ${dishes.length} active dishes in MongoDB. Seeding to Weaviate...`);
    for (const d of dishes) {
      try {
        const weaviateData = dishToWeaviate(d);
        await insertDishVector(weaviateData);
      } catch (err) {
        Logging.error(`Failed to insert dish ${d._id} to Weaviate: ${err}`);
      }
    }

    // 3. Reviews
    const reviews = await ReviewModel.find({
      $and: [{ deleted: { $ne: true } }, { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }]
    });
    Logging.info(`Found ${reviews.length} active reviews in MongoDB. Seeding to Weaviate...`);
    for (const rev of reviews) {
      try {
        const weaviateData = reviewToWeaviate(rev);
        await insertReviewVector(weaviateData);
      } catch (err) {
        Logging.error(`Failed to insert review ${rev._id} to Weaviate: ${err}`);
      }
    }

    // 4. Rewards
    const rewards = await RewardModel.find({
      $and: [{ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }, { $or: [{ deleted: { $ne: true } }] }]
    });
    Logging.info(`Found ${rewards.length} active rewards in MongoDB. Seeding to Weaviate...`);
    for (const rew of rewards) {
      try {
        const weaviateData = rewardToWeaviate(rew);
        await insertRewardVector(weaviateData);
      } catch (err) {
        Logging.error(`Failed to insert reward ${rew._id} to Weaviate: ${err}`);
      }
    }

    Logging.info('Weaviate seeding completed successfully.');
  } catch (error) {
    Logging.error('Error inserting data:');
    Logging.error(error);
    throw error;
  }
};
