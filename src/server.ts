import http from 'http';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

import app from './app';
import { config } from './config/config';
import Logging from './library/logging';
import { insertData } from './utils/dataSeeder';
import { initWeaviate } from './services/weaviate-init.service';
import { ChatService } from './services/chat';
import { googleWalletService } from './services/googleWallet.service';

const startServer = async () => {
  try {
    await mongoose.connect(config.mongo.url, { retryWrites: true, w: 'majority' });

    Logging.info('Mongo connected successfully.');
    try {
      await initWeaviate();
      await insertData();
    } catch (weaviateError) {
      Logging.error('Weaviate initialization failed, but starting server anyway:');
      Logging.error(weaviateError);
    }

    // Initialize Google Wallet LoyaltyClass (fire and forget)
    googleWalletService.createOrUpdateLoyaltyClass().catch((err) => {
      Logging.error(`Google Wallet Init Error: ${err}`);
    });

    const httpServer = http.createServer(app);

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      }
    });

    const chatService = new ChatService(io);
    chatService.inicializarSockets();

    // Escuchar en '0.0.0.0' para permitir conexiones desde dispositivos de la misma red (como el móvil)
    httpServer.listen(config.server.port, '0.0.0.0', () => {
      Logging.info(`Server is running on port ${config.server.port} (0.0.0.0)`);
    });
  } catch (error) {
    Logging.error(error);
  }
};
startServer();
