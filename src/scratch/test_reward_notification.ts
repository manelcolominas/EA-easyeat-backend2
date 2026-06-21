import mongoose from 'mongoose';
import { config } from '../config/config';
import { RestaurantModel } from '../models/restaurant';
import { CustomerModel } from '../models/customer';
import { PointsWalletModel } from '../models/pointsWallet';
import { NotificationModel } from '../models/notification';
import { RewardModel } from '../models/reward';
import RewardService from '../services/reward';
import Logging from '../library/logging';

async function runTest() {
  try {
    Logging.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongo.url);
    Logging.info('Connected.');

    const uniqueSuffix = Date.now();

    // 1. Create a test Restaurant
    Logging.info('Creating test restaurant...');
    const restaurant = new RestaurantModel({
      _id: new mongoose.Types.ObjectId(),
      profile: {
        name: `Test Restaurant ${uniqueSuffix}`,
        description: 'This is a description for testing notifications.',
        category: ['Italià'],
        location: {
          city: 'Barcelona',
          address: 'Carrer de la Prova, 123',
          coordinates: {
            type: 'Point',
            coordinates: [2.1734, 41.3851]
          }
        },
        pointsSystem: {
          method: 'simple',
          pointsPerEuro: 10,
          maxPointsVisit: 500
        }
      }
    });
    await restaurant.save();
    Logging.info(`Restaurant created: ${restaurant.profile.name} (${restaurant._id})`);

    // 2. Create another restaurant for testing isolation
    const otherRestaurant = new RestaurantModel({
      _id: new mongoose.Types.ObjectId(),
      profile: {
        name: `Other Restaurant ${uniqueSuffix}`,
        description: 'This is a description for testing notification isolation.',
        category: ['Japonès'],
        location: {
          city: 'Barcelona',
          coordinates: {
            type: 'Point',
            coordinates: [2.1734, 41.3851]
          }
        },
        pointsSystem: {
          method: 'simple',
          pointsPerEuro: 10,
          maxPointsVisit: 500
        }
      }
    });
    await otherRestaurant.save();

    // 3. Create test customers
    Logging.info('Creating test customers...');

    // Customer A: active, has restaurant as favorite
    const customerA = new CustomerModel({
      name: `Customer A ${uniqueSuffix}`,
      email: `customer_a_${uniqueSuffix}@test.com`,
      favoriteRestaurants: [restaurant._id],
      deletedAt: null
    });
    await customerA.save();

    // Customer B: active, has points (> 0) from restaurant
    const customerB = new CustomerModel({
      name: `Customer B ${uniqueSuffix}`,
      email: `customer_b_${uniqueSuffix}@test.com`,
      deletedAt: null
    });
    await customerB.save();

    const walletB = new PointsWalletModel({
      customer_id: customerB._id,
      restaurant_id: restaurant._id,
      points: 50
    });
    await walletB.save();
    customerB.pointsWallet = [walletB._id as any];
    await customerB.save();

    // Customer C: active, has points = 0 from restaurant, not favorite
    const customerC = new CustomerModel({
      name: `Customer C ${uniqueSuffix}`,
      email: `customer_c_${uniqueSuffix}@test.com`,
      deletedAt: null
    });
    await customerC.save();

    const walletC = new PointsWalletModel({
      customer_id: customerC._id,
      restaurant_id: restaurant._id,
      points: 0
    });
    await walletC.save();
    customerC.pointsWallet = [walletC._id as any];
    await customerC.save();

    // Customer D: soft-deleted, has points (> 0) and favorite
    const customerD = new CustomerModel({
      name: `Customer D ${uniqueSuffix}`,
      email: `customer_d_${uniqueSuffix}@test.com`,
      favoriteRestaurants: [restaurant._id],
      deletedAt: new Date()
    });
    await customerD.save();

    const walletD = new PointsWalletModel({
      customer_id: customerD._id,
      restaurant_id: restaurant._id,
      points: 50
    });
    await walletD.save();
    customerD.pointsWallet = [walletD._id as any];
    await customerD.save();

    // Customer E: active, has points (> 0) but from a different restaurant
    const customerE = new CustomerModel({
      name: `Customer E ${uniqueSuffix}`,
      email: `customer_e_${uniqueSuffix}@test.com`,
      deletedAt: null
    });
    await customerE.save();

    const walletE = new PointsWalletModel({
      customer_id: customerE._id,
      restaurant_id: otherRestaurant._id,
      points: 50
    });
    await walletE.save();
    customerE.pointsWallet = [walletE._id as any];
    await customerE.save();

    Logging.info('Customers created.');

    // 4. Create new reward
    Logging.info('Creating new reward to trigger notifications...');
    const rewardName = `Free Tapa ${uniqueSuffix}`;
    const savedReward = await RewardService.createReward({
      restaurant_id: restaurant._id as any,
      name: rewardName,
      description: 'Exchange 50 points for a free tapa!',
      pointsRequired: 50,
      active: true
    });
    Logging.info(`Reward created: ${savedReward.name} (${savedReward._id})`);

    // 5. Verify Notifications
    Logging.info('Fetching notifications generated for this restaurant...');
    const notifications = await NotificationModel.find({
      restaurant_id: restaurant._id,
      type: 'new_reward'
    }).lean();

    Logging.info(`Found ${notifications.length} notifications.`);

    const notifiedCustomerIds = notifications.map((n) => n.customer_id.toString());

    const hasA = notifiedCustomerIds.includes(customerA._id.toString());
    const hasB = notifiedCustomerIds.includes(customerB._id.toString());
    const hasC = notifiedCustomerIds.includes(customerC._id.toString());
    const hasD = notifiedCustomerIds.includes(customerD._id.toString());
    const hasE = notifiedCustomerIds.includes(customerE._id.toString());

    Logging.info('\n--- VERIFICATION RESULTS ---');
    Logging.info(`Customer A (Favorite) notified: ${hasA} (Expected: true)`);
    Logging.info(`Customer B (Points > 0) notified: ${hasB} (Expected: true)`);
    Logging.info(`Customer C (Points = 0) notified: ${hasC} (Expected: false)`);
    Logging.info(`Customer D (Soft-deleted) notified: ${hasD} (Expected: false)`);
    Logging.info(`Customer E (Points on other rest) notified: ${hasE} (Expected: false)`);

    let success = true;
    if (!hasA || !hasB || hasC || hasD || hasE) {
      Logging.error('❌ TEST FAILED: Notification logic does not match specification!');
      success = false;
    } else {
      Logging.info('✅ TEST PASSED: Notification logic is fully correct!');
    }

    // 6. Cleanup
    Logging.info('\nCleaning up test data...');
    await RewardModel.deleteMany({ restaurant_id: { $in: [restaurant._id, otherRestaurant._id] } });
    await PointsWalletModel.deleteMany({ _id: { $in: [walletB._id, walletC._id, walletD._id, walletE._id] } });
    await CustomerModel.deleteMany({ _id: { $in: [customerA._id, customerB._id, customerC._id, customerD._id, customerE._id] } });
    await NotificationModel.deleteMany({ restaurant_id: { $in: [restaurant._id, otherRestaurant._id] } });
    await RestaurantModel.deleteMany({ _id: { $in: [restaurant._id, otherRestaurant._id] } });
    Logging.info('Cleanup complete.');

    await mongoose.disconnect();
    process.exit(success ? 0 : 1);
  } catch (error) {
    Logging.error('Error running test:', error);
    process.exit(1);
  }
}

runTest();
