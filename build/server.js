"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = require("socket.io");
const config_1 = require("./config/config");
const logging_1 = __importDefault(require("./library/logging"));
const dataSeeder_1 = require("./utils/dataSeeder");
const restaurant_1 = __importDefault(require("./routes/restaurant"));
const review_1 = __importDefault(require("./routes/review"));
const customer_1 = __importDefault(require("./routes/customer"));
const reward_1 = __importDefault(require("./routes/reward"));
const visit_1 = __importDefault(require("./routes/visit"));
const badge_1 = __importDefault(require("./routes/badge"));
const dish_1 = __importDefault(require("./routes/dish"));
const employee_1 = __importDefault(require("./routes/employee"));
const pointsWallet_1 = __importDefault(require("./routes/pointsWallet"));
const rewardRedemption_1 = __importDefault(require("./routes/rewardRedemption"));
const statistics_1 = __importDefault(require("./routes/statistics"));
const dishRating_1 = __importDefault(require("./routes/dishRating"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const support_1 = __importDefault(require("./routes/support"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./swagger");
const chat_2 = require("./services/chat");
const router = (0, express_1.default)();
const corsOptions = {
    origin: config_1.config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    logging_1.default.info('Mongo connected successfully.');
    yield (0, dataSeeder_1.insertData)();
    StartServer();
}))
    .catch((error) => logging_1.default.error(error));
// Initialize Google Wallet LoyaltyClass (fire and forget)
const googleWallet_service_1 = require("./services/googleWallet.service");
googleWallet_service_1.googleWalletService.createOrUpdateLoyaltyClass().catch(err => {
    logging_1.default.error(`Google Wallet Init Error: ${err}`);
});
const StartServer = () => {
    router.use((req, res, next) => {
        logging_1.default.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on('finish', () => {
            logging_1.default.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });
        next();
    });
    router.use(express_1.default.urlencoded({ extended: true }));
    router.use(express_1.default.json());
    router.use((0, cookie_parser_1.default)());
    router.use((0, cors_1.default)(corsOptions));
    router.options('*', (0, cors_1.default)(corsOptions));
    router.use('/api', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
        swaggerOptions: {
            persistAuthorization: true
        }
    }));
    router.use('/auth', auth_1.default);
    router.get('/ping', (req, res) => {
        res.status(200).json({ hello: 'world' });
    });
    router.get('/favicon.ico', (_req, res) => {
        res.status(204).end();
    });
    router.use('/restaurants', restaurant_1.default);
    router.use('/reviews', review_1.default);
    router.use('/customers', customer_1.default);
    router.use('/rewards', reward_1.default);
    router.use('/visits', visit_1.default);
    router.use('/badges', badge_1.default);
    router.use('/dishes', dish_1.default);
    router.use('/employees', employee_1.default);
    router.use('/pointsWallets', pointsWallet_1.default);
    router.use('/rewardRedemptions', rewardRedemption_1.default);
    router.use('/statistics', statistics_1.default);
    router.use('/dish-ratings', dishRating_1.default);
    router.use('/chat', chat_1.default);
    router.use('/support', support_1.default);
    router.use('/wallet', wallet_1.default);
    router.use((req, res) => {
        logging_1.default.error(new Error(`Not found: ${req.url}`));
        res.status(404).json({ message: 'Not found' });
    });
    const httpServer = http_1.default.createServer(router);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        }
    });
    const chatService = new chat_2.ChatService(io);
    chatService.inicializarSockets();
    // Escuchar en '0.0.0.0' para permitir conexiones desde dispositivos de la misma red (como el móvil)
    httpServer.listen(config_1.config.server.port, '0.0.0.0', () => {
        logging_1.default.info(`Server is running on port ${config_1.config.server.port} (0.0.0.0)`);
    });
};
//# sourceMappingURL=server.js.map