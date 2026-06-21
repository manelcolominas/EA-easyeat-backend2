import mongoose from 'mongoose';
import { AdminModel } from './models/admin';
import { config } from './config/config';

async function checkDatabase() {
  try {
    console.log('Connecting to:', config.mongo.url);
    await mongoose.connect(config.mongo.url);
    console.log('Connected.');

    const admins = await AdminModel.find({}).select('+password');
    console.log('Total admins found:', admins.length);

    if (admins.length > 0) {
      for (const admin of admins) {
        const isHashed = admin.password?.startsWith('$2b$');
        console.log(`- User: [${admin.email}]`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Password length: ${admin.password?.length}`);
        console.log(`  Is Hashed: ${isHashed}`);

        if (isHashed && admin.password) {
          const bcrypt = require('bcrypt');
          const match = await bcrypt.compare('Admin123', admin.password);
          console.log(`  >>> Does 'Admin123' match the hash? ${match}`);

          const matchLower = await bcrypt.compare('admin123', admin.password);
          console.log(`  >>> Does 'admin123' match the hash? ${matchLower}`);
        }
      }
    } else {
      console.log('No admins found in database.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during check:', error);
  }
}

checkDatabase();
