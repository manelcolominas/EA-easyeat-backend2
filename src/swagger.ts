import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import path from 'path';
import { config } from './config/config';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EASY-EAT API',
      version: '1.0.0',
      description: 'REST API for Restaurants and Customers'
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`
      },
      {
        url: 'https://ea-easyeat-backend2.onrender.com'
      },
      {
        url: 'https://ea2-api.upc.edu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [path.join(__dirname, 'routes', '*.{ts,js}').replace(/\\/g, '/')]
};

export const swaggerSpec = swaggerJSDoc(options);
