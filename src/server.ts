import http from 'http';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

import app from './app';
import { config } from './config/config';
import Logging from './library/logging';
import { insertData } from './utils/dataSeeder';
import { initWeaviate } from './services/weaviate-init.service';
import { ChatService } from './services/chat';

const startServer = async () => {
  try {
    await mongoose.connect(config.mongo.url, { retryWrites: true, w: 'majority' });

    Logging.info('Mongo connected successfully.');
    await initWeaviate();
    await insertData();

    const httpServer = http.createServer(app);

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      }
    });

    const chatService = new ChatService(io);
    chatService.inicializarSockets();

    httpServer.listen(config.server.port, () => {
      Logging.info(`Server is running on port ${config.server.port}`);
    });

    /*
      // Per provar amb mòbil real a la mateixa xarxa:
      httpServer.listen(config.server.port, '0.0.0.0', () => {
        Logging.info(`Server is running on port ${config.server.port}`);
      });
    */
  } catch (error) {
    Logging.error(error);
  }
};

startServer();
