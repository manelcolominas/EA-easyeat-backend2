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
const reward_1 = require('../models/reward');
const dish_1 = require('../models/dish');
const customerDeviceToken_1 = require('../models/customerDeviceToken');
const notification_1 = __importDefault(require('../services/notification'));
function runTest() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      console.log('Connecting to MongoDB...');
      yield mongoose_1.default.connect(config_1.config.mongo.url);
      console.log('Connected.');
      // 1. Find a customer with an active device token
      console.log('Searching for registered customer device tokens...');
      const latestTokenRecord = yield customerDeviceToken_1.CustomerDeviceTokenModel.findOne({
        active: true,
        deletedAt: null
      }).sort({ updatedAt: -1 });
      let targetCustomerId;
      let deviceToken = '';
      if (latestTokenRecord) {
        targetCustomerId = latestTokenRecord.customer_id;
        deviceToken = latestTokenRecord.token;
        console.log(`Found active device token for Customer ID: ${targetCustomerId}`);
        console.log(`Token snippet: ${deviceToken.substring(0, 15)}...`);
      } else {
        console.log('⚠️ No active customer device tokens found!');
        console.log('Please log in as a customer in the Flutter app to register a device token.');
        console.log('Using a mock customer for testing database insertion only.');
        // Find any customer, or create a mock
        const anyCustomer = yield customer_1.CustomerModel.findOne({ deletedAt: null });
        if (anyCustomer) {
          targetCustomerId = anyCustomer._id;
        } else {
          const mockCustomer = new customer_1.CustomerModel({
            name: 'Test Customer',
            email: `test_${Date.now()}@test.com`,
            deletedAt: null
          });
          yield mockCustomer.save();
          targetCustomerId = mockCustomer._id;
        }
      }
      // 2. Find or create a restaurant
      let restaurant = yield restaurant_1.RestaurantModel.findOne();
      if (!restaurant) {
        console.log('Creating test restaurant...');
        restaurant = new restaurant_1.RestaurantModel({
          profile: {
            name: 'EasyEat Notification Test Restaurant',
            description: 'A temporary restaurant for testing notifications.',
            category: ['Italià'],
            location: {
              city: 'Barcelona',
              address: 'Carrer de Test, 1',
              coordinates: { type: 'Point', coordinates: [2.1734, 41.3851] }
            },
            pointsSystem: { method: 'simple', pointsPerEuro: 10, maxPointsVisit: 500 }
          }
        });
        yield restaurant.save();
      }
      console.log(`Using Restaurant: ${restaurant.profile.name} (${restaurant._id})`);
      // 3. Find or create a reward
      let reward = yield reward_1.RewardModel.findOne({ restaurant_id: restaurant._id });
      if (!reward) {
        console.log('Creating test reward...');
        reward = new reward_1.RewardModel({
          restaurant_id: restaurant._id,
          name: 'Tapa Gratuïta Test',
          description: 'Una tapa gratis per a proves de notificacions.',
          pointsRequired: 50,
          active: true
        });
        yield reward.save();
      }
      console.log(`Using Reward: ${reward.name} (${reward._id})`);
      // 4. Find or create a dish
      let dish = yield dish_1.DishModel.findOne({ restaurant_id: restaurant._id });
      if (!dish) {
        console.log('Creating test dish...');
        dish = new dish_1.DishModel({
          restaurant_id: restaurant._id,
          name: 'Pasta Carbonara Test',
          description: 'Plat de pasta per a proves de notificacions.',
          price: 12.5,
          active: true
        });
        yield dish.save();
      }
      console.log(`Using Dish: ${dish.name} (${dish._id})`);
      // 5. Send notifications
      console.log('\n--- SENDING TEST NOTIFICATIONS ---');
      // Scenario 1: New Reward Created
      console.log('Sending Scenario 1: New Reward...');
      const notif1 = yield notification_1.default.createAndSendNotification({
        customer_id: targetCustomerId,
        restaurant_id: restaurant._id,
        type: 'new_reward',
        title: `Nova recompensa a ${restaurant.profile.name}!`,
        message: `S'ha afegit una nova recompensa: "${reward.name}". Aprofita els teus punts!`,
        data: {
          reward_id: reward._id
        }
      });
      console.log(`Notification 1 ID: ${notif1._id}, fcmSent: ${notif1.fcmSent}, fcmError: ${notif1.fcmError}`);
      // Scenario 2: New Dish Created
      console.log('Sending Scenario 2: New Dish...');
      const notif2 = yield notification_1.default.createAndSendNotification({
        customer_id: targetCustomerId,
        restaurant_id: restaurant._id,
        type: 'new_dish',
        title: `Nou plat a ${restaurant.profile.name}!`,
        message: `S'ha afegit un nou plat: "${dish.name}". Vine a provar-lo!`,
        data: {
          dish_id: dish._id
        }
      });
      console.log(`Notification 2 ID: ${notif2._id}, fcmSent: ${notif2.fcmSent}, fcmError: ${notif2.fcmError}`);
      // Scenario 3: Points Expiring
      console.log('Sending Scenario 3: Points Expiring...');
      const notif3 = yield notification_1.default.createAndSendNotification({
        customer_id: targetCustomerId,
        restaurant_id: restaurant._id,
        type: 'points_expiring',
        title: 'Punts a punt de caducar!',
        message: `Tens 150 punts a "${restaurant.profile.name}" que estan a punt de caducar. Fes-los servir abans del 30 de juny!`,
        data: {
          points_expiring_count: 150,
          expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days from now
        }
      });
      console.log(`Notification 3 ID: ${notif3._id}, fcmSent: ${notif3.fcmSent}, fcmError: ${notif3.fcmError}`);
      // Scenario 4: Points Redeemed
      console.log('Sending Scenario 4: Points Redeemed...');
      const notif4 = yield notification_1.default.createAndSendNotification({
        customer_id: targetCustomerId,
        restaurant_id: restaurant._id,
        type: 'points_awarded',
        title: 'Recompensa bescanviada!',
        message: `Has bescanviat 50 punts per la recompensa "${reward.name}" a ${restaurant.profile.name}.`,
        data: {
          reward_id: reward._id,
          points_amount: 50
        }
      });
      console.log(`Notification 4 ID: ${notif4._id}, fcmSent: ${notif4.fcmSent}, fcmError: ${notif4.fcmError}`);
      console.log('\n--- VERIFICATION DONE ---');
      if (!latestTokenRecord) {
        console.log('Note: Notifications saved to MongoDB but FCM was not sent because no active device token was registered.');
      } else {
        console.log('Check your Flutter app or mobile notification shade. All 4 push notifications should have arrived!');
      }
      yield mongoose_1.default.disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error running notification verification script:', error);
      process.exit(1);
    }
  });
}
runTest();
//# sourceMappingURL=test_all_notifications.js.map
