'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const http_1 = __importDefault(require('http'));
const mongoose_1 = __importDefault(require('mongoose'));
const socket_io_1 = require('socket.io');
const app_1 = __importDefault(require('./app'));
const config_1 = require('./config/config');
const logging_1 = __importDefault(require('./library/logging'));
const dataSeeder_1 = require('./utils/dataSeeder');
const weaviate_init_service_1 = require('./services/weaviate-init.service');
const chat_1 = require('./services/chat');
const googleWallet_service_1 = require('./services/googleWallet.service');
const startServer = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      yield mongoose_1.default.connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' });
      logging_1.default.info('Mongo connected successfully.');
      try {
        yield (0, weaviate_init_service_1.initWeaviate)();
        yield (0, dataSeeder_1.insertData)();
      } catch (weaviateError) {
        logging_1.default.error('Weaviate initialization failed, but starting server anyway:');
        logging_1.default.error(weaviateError);
      }
      // Initialize Google Wallet LoyaltyClass (fire and forget)
      googleWallet_service_1.googleWalletService.createOrUpdateLoyaltyClass().catch((err) => {
        logging_1.default.error(`Google Wallet Init Error: ${err}`);
      });
      const httpServer = http_1.default.createServer(app_1.default);
      const io = new socket_io_1.Server(httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        }
      });
      const chatService = new chat_1.ChatService(io);
      chatService.inicializarSockets();
      // Escuchar en '0.0.0.0' para permitir conexiones desde dispositivos de la misma red (como el móvil)
      httpServer.listen(config_1.config.server.port, '0.0.0.0', () => {
        logging_1.default.info(`Server is running on port ${config_1.config.server.port} (0.0.0.0)`);
      });
    } catch (error) {
      logging_1.default.error(error);
    }
    startServer();
  });
//# sourceMappingURL=server.js.map
