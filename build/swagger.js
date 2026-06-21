'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require('swagger-jsdoc'));
const path_1 = __importDefault(require('path'));
const config_1 = require('./config/config');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EASY-EAT API',
      version: '1.0.0',
      description: 'REST API for Restaurants and Customers'
    },
    servers: [
      {
        url: `http://localhost:${config_1.config.server.port}`
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
  apis: [path_1.default.join(__dirname, 'routes', '*.{ts,js}').replace(/\\/g, '/')]
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map
