import mongoose from 'mongoose';
import { IVisit } from '../models/visit';
import { VisitModel } from '../models/visit';
import { PointsWalletModel } from '../models/pointsWallet';

const calculatePoints = (ownVisits: number, otherVisits: number, billAmount: number): number => {
    let pointsToAssign = (ownVisits * 0.375) + (otherVisits * 0.125) + (billAmount * 0.5);
    pointsToAssign = Math.floor(pointsToAssign);
    return pointsToAssign;
};

const pointsRedemption = async (data: Partial<IVisit>) => {
    try {
        const { customer_id, restaurant_id, billAmount } = data;

        if (!customer_id || !restaurant_id) {
            throw new Error('customer_id and restaurant_id are required');
        }

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const [ownVisits, otherVisits] = await Promise.all([
            VisitModel.countDocuments({
                customer_id,
                restaurant_id,
                date: { $gte: ninetyDaysAgo },
                deletedAt: null
            }),
            VisitModel.countDocuments({
                customer_id,
                restaurant_id: { $ne: restaurant_id },
                date: { $gte: ninetyDaysAgo },
                deletedAt: null
            })
        ]);

        const pointsToAssign = calculatePoints(ownVisits, otherVisits, billAmount ?? 0);

        const visit = new VisitModel({
            _id: new mongoose.Types.ObjectId(),
            ...data,
            pointsEarned: pointsToAssign
        });

        const savedVisit = await visit.save();

        // Update or create the points wallet for this customer and restaurant
        // Without transactions, this runs independently.
        await PointsWalletModel.findOneAndUpdate(
            { customer_id, restaurant_id },
            { $inc: { points: pointsToAssign } },
            { upsert: true, new: true }
        );

        return savedVisit;

    } catch (error) {
        throw error;
    }
};

export { pointsRedemption };
