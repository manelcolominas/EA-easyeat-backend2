import mongoose from 'mongoose';
import { VisitModel } from './src/models/visit';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easyeat_db';

async function checkVisits() {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const totalCount = await VisitModel.countDocuments({});
    console.log('Total visits in DB:', totalCount);

    const visits = await VisitModel.find({}).limit(5).lean();
    console.log('Sample visits:', JSON.stringify(visits, null, 2));

    const revenueStats = await VisitModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$billAmount' },
          totalRevenueSnake: { $sum: '$bill_amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Global Revenue Stats:', revenueStats);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVisits();
