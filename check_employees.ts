import mongoose from 'mongoose';
import { EmployeeModel } from './src/models/employee';
import { VisitModel } from './src/models/visit';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easyeat_db';

async function checkEmployees() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const employees = await EmployeeModel.find({}).lean();
        
        for (const emp of employees) {
            console.log(`Employee: ${emp.profile.name} (${emp._id}) - Restaurant: ${emp.restaurant_id}`);
            const visits = await VisitModel.find({ employee_id: emp._id }).lean();
            for(const v of visits) {
                console.log(`  Visit: ${v._id}, Rest: ${v.restaurant_id}, Bill: ${v.billAmount}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkEmployees();
