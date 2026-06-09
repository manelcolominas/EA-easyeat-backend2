import mongoose from 'mongoose';
import { config } from '../config/config';
import { RestaurantModel } from '../models/restaurant';
import { CustomerModel } from '../models/customer';
import { RewardModel } from '../models/reward';
import { DishModel } from '../models/dish';
import { CustomerDeviceTokenModel } from '../models/customerDeviceToken';
import NotificationService from '../services/notification';

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongo.url);
    console.log('Connected.');

    // 1. Find a customer with an active device token
    console.log('Searching for registered customer device tokens...');
    const latestTokenRecord = await CustomerDeviceTokenModel.findOne({
      active: true,
      deletedAt: null
    }).sort({ updatedAt: -1 });

    let targetCustomerId: mongoose.Types.ObjectId;
    let deviceToken: string = '';

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
      const anyCustomer = await CustomerModel.findOne({ deletedAt: null });
      if (anyCustomer) {
        targetCustomerId = anyCustomer._id;
      } else {
        const mockCustomer = new CustomerModel({
          name: 'Test Customer',
          email: `test_${Date.now()}@test.com`,
          deletedAt: null
        });
        await mockCustomer.save();
        targetCustomerId = mockCustomer._id;
      }
    }

    // 2. Find or create a restaurant
    let restaurant = await RestaurantModel.findOne();
    if (!restaurant) {
      console.log('Creating test restaurant...');
      restaurant = new RestaurantModel({
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
      await restaurant.save();
    }
    console.log(`Using Restaurant: ${restaurant.profile.name} (${restaurant._id})`);

    // 3. Find or create a reward
    let reward = await RewardModel.findOne({ restaurant_id: restaurant._id });
    if (!reward) {
      console.log('Creating test reward...');
      reward = new RewardModel({
        restaurant_id: restaurant._id,
        name: 'Tapa Gratuïta Test',
        description: 'Una tapa gratis per a proves de notificacions.',
        pointsRequired: 50,
        active: true
      });
      await reward.save();
    }
    console.log(`Using Reward: ${reward.name} (${reward._id})`);

    // 4. Find or create a dish
    let dish = await DishModel.findOne({ restaurant_id: restaurant._id });
    if (!dish) {
      console.log('Creating test dish...');
      dish = new DishModel({
        restaurant_id: restaurant._id,
        name: 'Pasta Carbonara Test',
        description: 'Plat de pasta per a proves de notificacions.',
        price: 12.5,
        active: true
      });
      await dish.save();
    }
    console.log(`Using Dish: ${dish.name} (${dish._id})`);

    // 5. Send notifications
    console.log('\n--- SENDING TEST NOTIFICATIONS ---');

    // Scenario 1: New Reward Created
    console.log('Sending Scenario 1: New Reward...');
    const notif1 = await NotificationService.createAndSendNotification({
      customer_id: targetCustomerId as any,
      restaurant_id: restaurant._id as any,
      type: 'new_reward',
      title: `Nova recompensa a ${restaurant.profile.name}!`,
      message: `S'ha afegit una nova recompensa: "${reward.name}". Aprofita els teus punts!`,
      data: {
        reward_id: reward._id as any
      }
    });
    console.log(`Notification 1 ID: ${notif1._id}, fcmSent: ${notif1.fcmSent}, fcmError: ${notif1.fcmError}`);

    // Scenario 2: New Dish Created
    console.log('Sending Scenario 2: New Dish...');
    const notif2 = await NotificationService.createAndSendNotification({
      customer_id: targetCustomerId as any,
      restaurant_id: restaurant._id as any,
      type: 'new_dish',
      title: `Nou plat a ${restaurant.profile.name}!`,
      message: `S'ha afegit un nou plat: "${dish.name}". Vine a provar-lo!`,
      data: {
        dish_id: dish._id as any
      }
    });
    console.log(`Notification 2 ID: ${notif2._id}, fcmSent: ${notif2.fcmSent}, fcmError: ${notif2.fcmError}`);

    // Scenario 3: Points Expiring
    console.log('Sending Scenario 3: Points Expiring...');
    const notif3 = await NotificationService.createAndSendNotification({
      customer_id: targetCustomerId as any,
      restaurant_id: restaurant._id as any,
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
    const notif4 = await NotificationService.createAndSendNotification({
      customer_id: targetCustomerId as any,
      restaurant_id: restaurant._id as any,
      type: 'points_awarded',
      title: 'Recompensa bescanviada!',
      message: `Has bescanviat 50 punts per la recompensa "${reward.name}" a ${restaurant.profile.name}.`,
      data: {
        reward_id: reward._id as any,
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

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error running notification verification script:', error);
    process.exit(1);
  }
}

runTest();
