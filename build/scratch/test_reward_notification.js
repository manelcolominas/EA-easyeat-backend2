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
const mongoose_1 = __importDefault(require('mongoose'));
const config_1 = require('../config/config');
const restaurant_1 = require('../models/restaurant');
const customer_1 = require('../models/customer');
const pointsWallet_1 = require('../models/pointsWallet');
const notification_1 = require('../models/notification');
const reward_1 = require('../models/reward');
const reward_2 = __importDefault(require('../services/reward'));
function runTest() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      console.log('Connecting to MongoDB...');
      yield mongoose_1.default.connect(config_1.config.mongo.url);
      console.log('Connected.');
      const uniqueSuffix = Date.now();
      // 1. Create a test Restaurant
      console.log('Creating test restaurant...');
      const restaurant = new restaurant_1.RestaurantModel({
        _id: new mongoose_1.default.Types.ObjectId(),
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
      yield restaurant.save();
      console.log(`Restaurant created: ${restaurant.profile.name} (${restaurant._id})`);
      // 2. Create another restaurant for testing isolation
      const otherRestaurant = new restaurant_1.RestaurantModel({
        _id: new mongoose_1.default.Types.ObjectId(),
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
      yield otherRestaurant.save();
      // 3. Create test customers
      console.log('Creating test customers...');
      // Customer A: active, has restaurant as favorite
      const customerA = new customer_1.CustomerModel({
        name: `Customer A ${uniqueSuffix}`,
        email: `customer_a_${uniqueSuffix}@test.com`,
        favoriteRestaurants: [restaurant._id],
        deletedAt: null
      });
      yield customerA.save();
      // Customer B: active, has points (> 0) from restaurant
      const customerB = new customer_1.CustomerModel({
        name: `Customer B ${uniqueSuffix}`,
        email: `customer_b_${uniqueSuffix}@test.com`,
        deletedAt: null
      });
      yield customerB.save();
      const walletB = new pointsWallet_1.PointsWalletModel({
        customer_id: customerB._id,
        restaurant_id: restaurant._id,
        points: 50
      });
      yield walletB.save();
      customerB.pointsWallet = [walletB._id];
      yield customerB.save();
      // Customer C: active, has points = 0 from restaurant, not favorite
      const customerC = new customer_1.CustomerModel({
        name: `Customer C ${uniqueSuffix}`,
        email: `customer_c_${uniqueSuffix}@test.com`,
        deletedAt: null
      });
      yield customerC.save();
      const walletC = new pointsWallet_1.PointsWalletModel({
        customer_id: customerC._id,
        restaurant_id: restaurant._id,
        points: 0
      });
      yield walletC.save();
      customerC.pointsWallet = [walletC._id];
      yield customerC.save();
      // Customer D: soft-deleted, has points (> 0) and favorite
      const customerD = new customer_1.CustomerModel({
        name: `Customer D ${uniqueSuffix}`,
        email: `customer_d_${uniqueSuffix}@test.com`,
        favoriteRestaurants: [restaurant._id],
        deletedAt: new Date()
      });
      yield customerD.save();
      const walletD = new pointsWallet_1.PointsWalletModel({
        customer_id: customerD._id,
        restaurant_id: restaurant._id,
        points: 50
      });
      yield walletD.save();
      customerD.pointsWallet = [walletD._id];
      yield customerD.save();
      // Customer E: active, has points (> 0) but from a different restaurant
      const customerE = new customer_1.CustomerModel({
        name: `Customer E ${uniqueSuffix}`,
        email: `customer_e_${uniqueSuffix}@test.com`,
        deletedAt: null
      });
      yield customerE.save();
      const walletE = new pointsWallet_1.PointsWalletModel({
        customer_id: customerE._id,
        restaurant_id: otherRestaurant._id,
        points: 50
      });
      yield walletE.save();
      customerE.pointsWallet = [walletE._id];
      yield customerE.save();
      console.log('Customers created.');
      // 4. Create new reward
      console.log('Creating new reward to trigger notifications...');
      const rewardName = `Free Tapa ${uniqueSuffix}`;
      const savedReward = yield reward_2.default.createReward({
        restaurant_id: restaurant._id,
        name: rewardName,
        description: 'Exchange 50 points for a free tapa!',
        pointsRequired: 50,
        active: true
      });
      console.log(`Reward created: ${savedReward.name} (${savedReward._id})`);
      // 5. Verify Notifications
      console.log('Fetching notifications generated for this restaurant...');
      const notifications = yield notification_1.NotificationModel.find({
        restaurant_id: restaurant._id,
        type: 'new_reward'
      }).lean();
      console.log(`Found ${notifications.length} notifications.`);
      const notifiedCustomerIds = notifications.map((n) => n.customer_id.toString());
      const hasA = notifiedCustomerIds.includes(customerA._id.toString());
      const hasB = notifiedCustomerIds.includes(customerB._id.toString());
      const hasC = notifiedCustomerIds.includes(customerC._id.toString());
      const hasD = notifiedCustomerIds.includes(customerD._id.toString());
      const hasE = notifiedCustomerIds.includes(customerE._id.toString());
      console.log('\n--- VERIFICATION RESULTS ---');
      console.log(`Customer A (Favorite) notified: ${hasA} (Expected: true)`);
      console.log(`Customer B (Points > 0) notified: ${hasB} (Expected: true)`);
      console.log(`Customer C (Points = 0) notified: ${hasC} (Expected: false)`);
      console.log(`Customer D (Soft-deleted) notified: ${hasD} (Expected: false)`);
      console.log(`Customer E (Points on other rest) notified: ${hasE} (Expected: false)`);
      let success = true;
      if (!hasA || !hasB || hasC || hasD || hasE) {
        console.error('❌ TEST FAILED: Notification logic does not match specification!');
        success = false;
      } else {
        console.log('✅ TEST PASSED: Notification logic is fully correct!');
      }
      // 6. Cleanup
      console.log('\nCleaning up test data...');
      yield reward_1.RewardModel.deleteMany({ restaurant_id: { $in: [restaurant._id, otherRestaurant._id] } });
      yield pointsWallet_1.PointsWalletModel.deleteMany({ _id: { $in: [walletB._id, walletC._id, walletD._id, walletE._id] } });
      yield customer_1.CustomerModel.deleteMany({ _id: { $in: [customerA._id, customerB._id, customerC._id, customerD._id, customerE._id] } });
      yield notification_1.NotificationModel.deleteMany({ restaurant_id: { $in: [restaurant._id, otherRestaurant._id] } });
      yield restaurant_1.RestaurantModel.deleteMany({ _id: { $in: [restaurant._id, otherRestaurant._id] } });
      console.log('Cleanup complete.');
      yield mongoose_1.default.disconnect();
      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error('Error running test:', error);
      process.exit(1);
    }
  });
}
runTest();
//# sourceMappingURL=test_reward_notification.js.map
