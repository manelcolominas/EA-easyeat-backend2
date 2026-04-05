import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './config/config';
import Logging from './library/logging';
import { insertData } from './utils/dataSeeder';

import restaurantRoutes from './routes/restaurant';
import reviewRoutes from './routes/review';
import customerRoutes from './routes/customer';
import rewardRoutes from './routes/reward';
import visitRoutes from './routes/visit';
import authRoutes from './routes/auth';
import { requireAdmin } from './middleware/auth';



import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

const router = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(async () => {
        Logging.info('Mongo connected successfully.');
        await insertData();
        StartServer();
    })
    .catch((error) => Logging.error(error));

/** Only Start Server if Mongoose Connects */
const StartServer = () => {
    /** Log the request */
    router.use((req, res, next) => {
        Logging.info(
            `Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
        );

        res.on('finish', () => {
            Logging.info(
                `Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`
            );
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** Rules of our API */
    router.use(cors());

    /** Swagger */
    router.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    /** Public Routes */
    router.use('/auth', authRoutes);

    /** Protected backoffice Routes */
    //router.use(requireAdmin);

    /** Routes publiques */
    router.use('/restaurants', restaurantRoutes);
    router.use('/reviews', reviewRoutes);
    router.use('/customers', customerRoutes);
    router.use('/rewards', rewardRoutes);
    router.use('/visits', visitRoutes);

    /**Rutes admin backoffice */
    router.use('/admin/restaurants', requireAdmin, restaurantRoutes);
    router.use('/admin/reviews', requireAdmin, reviewRoutes);
    router.use('/admin/customers', requireAdmin, customerRoutes);
    router.use('/admin/rewards', requireAdmin, rewardRoutes);
    router.use('/admin/visits', requireAdmin, visitRoutes);

    /** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ hello: 'world' }));

    /** Error handling */
    router.use((req, res, next) => {
        const error = new Error('Not found');

        Logging.error(error);

        res.status(404).json({
            message: error.message
        });
    });

    http.createServer(router).listen(config.server.port, () =>
        Logging.info(`Server is running on port ${config.server.port}`)
    );
};
