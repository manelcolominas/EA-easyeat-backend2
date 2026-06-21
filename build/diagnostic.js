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
const mongoose_1 = __importDefault(require('mongoose'));
const admin_1 = require('./models/admin');
const config_1 = require('./config/config');
const logging_1 = __importDefault(require('./library/logging'));
function checkDatabase() {
  return __awaiter(this, void 0, void 0, function* () {
    var _a, _b;
    try {
      logging_1.default.info('Connecting to:', config_1.config.mongo.url);
      yield mongoose_1.default.connect(config_1.config.mongo.url);
      logging_1.default.info('Connected.');
      const admins = yield admin_1.AdminModel.find({}).select('+password');
      logging_1.default.info('Total admins found:', admins.length);
      if (admins.length > 0) {
        for (const admin of admins) {
          const isHashed = (_a = admin.password) === null || _a === void 0 ? void 0 : _a.startsWith('$2b$');
          logging_1.default.info(`- User: [${admin.email}]`);
          logging_1.default.info(`  Name: ${admin.name}`);
          logging_1.default.info(`  Password length: ${(_b = admin.password) === null || _b === void 0 ? void 0 : _b.length}`);
          logging_1.default.info(`  Is Hashed: ${isHashed}`);
          if (isHashed && admin.password) {
            const bcrypt = require('bcrypt');
            const match = yield bcrypt.compare('Admin123', admin.password);
            logging_1.default.info(`  >>> Does 'Admin123' match the hash? ${match}`);
            const matchLower = yield bcrypt.compare('admin123', admin.password);
            logging_1.default.info(`  >>> Does 'admin123' match the hash? ${matchLower}`);
          }
        }
      } else {
        logging_1.default.info('No admins found in database.');
      }
      yield mongoose_1.default.disconnect();
    } catch (error) {
      logging_1.default.error('Error during check:', error);
    }
  });
}
checkDatabase();
//# sourceMappingURL=diagnostic.js.map
