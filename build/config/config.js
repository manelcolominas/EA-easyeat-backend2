'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config();
const MONGO_URL = process.env.MONGO_URI || '';
const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337;
const DEFAULT_CORS_ORIGINS = ['https://ea2.upc.edu', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:49671', 'http://localhost:4200'];
const CORS_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : DEFAULT_CORS_ORIGINS;
exports.config = {
  mongo: {
    url: MONGO_URL
  },
  server: {
    port: SERVER_PORT
  },
  cors: {
    origins: CORS_ORIGINS
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'cce788eebd26d18a40e2f414c69692bb9bdedd9fc3438d92e52915359abe8d59',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '9a23ae4899d12aa77c66240a3b4a058f935e3634d06a72a4311e7d290274c121',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  cookies: {
    refreshName: 'refreshToken',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    }
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  llm: {
    url: process.env.LLM_API_URL || 'http://10.4.119.50:8080/api/generate',
    model: process.env.MODEL || 'qwen2.5:14b'
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    wallet: {
      issuerId: process.env.GOOGLE_WALLET_ISSUER_ID || '',
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
    }
  },
  // Firebase service account credentials (optional)
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    // Private key may contain newlines that are escaped in env files
    privateKey: process.env.FIREBASE_PRIVATE_KEY || ''
  }
};
//# sourceMappingURL=config.js.map
