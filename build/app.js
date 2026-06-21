'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cors_1 = __importDefault(require('cors'));
const cookie_parser_1 = __importDefault(require('cookie-parser'));
const swagger_ui_express_1 = __importDefault(require('swagger-ui-express'));
const config_1 = require('./config/config');
const logging_1 = __importDefault(require('./library/logging'));
const swagger_1 = require('./swagger');
const restaurant_1 = __importDefault(require('./routes/restaurant'));
const review_1 = __importDefault(require('./routes/review'));
const customer_1 = __importDefault(require('./routes/customer'));
const reward_1 = __importDefault(require('./routes/reward'));
const visit_1 = __importDefault(require('./routes/visit'));
const badge_1 = __importDefault(require('./routes/badge'));
const dish_1 = __importDefault(require('./routes/dish'));
const employee_1 = __importDefault(require('./routes/employee'));
const pointsWallet_1 = __importDefault(require('./routes/pointsWallet'));
const rewardRedemption_1 = __importDefault(require('./routes/rewardRedemption'));
const statistics_1 = __importDefault(require('./routes/statistics'));
const dishRating_1 = __importDefault(require('./routes/dishRating'));
const auth_1 = __importDefault(require('./routes/auth'));
const chat_1 = __importDefault(require('./routes/chat'));
const support_1 = __importDefault(require('./routes/support'));
const report_1 = __importDefault(require('./routes/report'));
const notification_1 = __importDefault(require('./routes/notification'));
const customerDeviceToken_1 = __importDefault(require('./routes/customerDeviceToken'));
const generate_1 = __importDefault(require('./routes/generate'));
const app = (0, express_1.default)();
const corsOptions = {
  origin: config_1.config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((req, res, next) => {
  logging_1.default.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
  res.on('finish', () => {
    logging_1.default.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
  });
  next();
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(
  '/api',
  swagger_ui_express_1.default.serve,
  swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })
);
app.use('/auth', auth_1.default);
app.get('/ping', (_req, res) => {
  res.status(200).json({ hello: 'world' });
});
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});
app.use('/restaurants', restaurant_1.default);
app.use('/reviews', review_1.default);
app.use('/customers', customer_1.default);
app.use('/rewards', reward_1.default);
app.use('/visits', visit_1.default);
app.use('/badges', badge_1.default);
app.use('/dishes', dish_1.default);
app.use('/employees', employee_1.default);
app.use('/pointsWallets', pointsWallet_1.default);
app.use('/rewardRedemptions', rewardRedemption_1.default);
app.use('/statistics', statistics_1.default);
app.use('/dish-ratings', dishRating_1.default);
app.use('/chat', chat_1.default);
app.use('/support', support_1.default);
app.use('/', report_1.default);
app.use('/notifications', notification_1.default);
app.use('/customerDeviceTokens', customerDeviceToken_1.default);
app.use('/llm', generate_1.default);
app.use((req, res) => {
  logging_1.default.error(new Error(`Not found: ${req.url}`));
  res.status(404).json({ message: 'Not found' });
});
exports.default = app;
//# sourceMappingURL=app.js.map
