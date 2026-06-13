import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/config';
import Logging from './library/logging';
import { swaggerSpec } from './swagger';

import restaurantRoutes from './routes/restaurant';
import reviewRoutes from './routes/review';
import customerRoutes from './routes/customer';
import rewardRoutes from './routes/reward';
import visitRoutes from './routes/visit';
import badgeRoutes from './routes/badge';
import dishRoutes from './routes/dish';
import employeeRoutes from './routes/employee';
import pointsWallets from './routes/pointsWallet';
import rewardRedemption from './routes/rewardRedemption';
import statistics from './routes/statistics';
import dishRatingRoutes from './routes/dishRating';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import supportRoutes from './routes/support';
import notificationRoutes from './routes/notification';
import customerDeviceTokenRoutes from './routes/customerDeviceToken';

const app = express();

const corsOptions = {
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use((req, res, next) => {
  Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

  res.on('finish', () => {
    Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
  });

  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(
  '/api',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })
);

app.use('/auth', authRoutes);

app.get('/ping', (_req, res) => {
  res.status(200).json({ hello: 'world' });
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.use('/restaurants', restaurantRoutes);
app.use('/reviews', reviewRoutes);
app.use('/customers', customerRoutes);
app.use('/rewards', rewardRoutes);
app.use('/visits', visitRoutes);
app.use('/badges', badgeRoutes);
app.use('/dishes', dishRoutes);
app.use('/employees', employeeRoutes);
app.use('/pointsWallets', pointsWallets);
app.use('/rewardRedemptions', rewardRedemption);
app.use('/statistics', statistics);
app.use('/dish-ratings', dishRatingRoutes);
app.use('/chat', chatRoutes);
app.use('/support', supportRoutes);
app.use('/notifications', notificationRoutes);
app.use('/customerDeviceTokens', customerDeviceTokenRoutes);

app.use((req, res) => {
  Logging.error(new Error(`Not found: ${req.url}`));
  res.status(404).json({ message: 'Not found' });
});

export default app;
