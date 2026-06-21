import mongoose from 'mongoose';
import { AdminModel } from './models/admin';
import { config } from './config/config';
import Logging from './library/logging';

async function checkDatabase() {
  try {
    Logging.info('Connecting to:', config.mongo.url);
    await mongoose.connect(config.mongo.url);
    Logging.info('Connected.');

    const admins = await AdminModel.find({}).select('+password');
    Logging.info('Total admins found:', admins.length);

    if (admins.length > 0) {
      for (const admin of admins) {
        const isHashed = admin.password?.startsWith('$2b$');
        Logging.info(`- User: [${admin.email}]`);
        Logging.info(`  Name: ${admin.name}`);
        Logging.info(`  Password length: ${admin.password?.length}`);
        Logging.info(`  Is Hashed: ${isHashed}`);

        if (isHashed && admin.password) {
          const bcrypt = require('bcrypt');
          const match = await bcrypt.compare('Admin123', admin.password);
          Logging.info(`  >>> Does 'Admin123' match the hash? ${match}`);

          const matchLower = await bcrypt.compare('admin123', admin.password);
          Logging.info(`  >>> Does 'admin123' match the hash? ${matchLower}`);
        }
      }
    } else {
      Logging.info('No admins found in database.');
    }

    await mongoose.disconnect();
  } catch (error) {
    Logging.error('Error during check:', error);
  }
}

checkDatabase();
