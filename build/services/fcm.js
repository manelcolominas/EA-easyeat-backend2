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
exports.sendPushToTokens = void 0;
const firebase_admin_1 = __importDefault(require('firebase-admin'));
const config_1 = require('../config/config');
const firebaseInitialized = () => {
  var _a;
  if (firebase_admin_1.default.apps.length > 0) return;
  firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert({
      projectId: config_1.config.firebase.projectId,
      clientEmail: config_1.config.firebase.clientEmail,
      privateKey: (_a = config_1.config.firebase.privateKey) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n')
    })
  });
};
const sendPushToTokens = (tokens, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    firebaseInitialized();
    if (!tokens.length) {
      return {
        successCount: 0,
        failureCount: 0,
        failedTokens: []
      };
    }
    const message = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: (_a = payload.data) !== null && _a !== void 0 ? _a : {}
    };
    const response = yield firebase_admin_1.default.messaging().sendEachForMulticast(message);
    const failedTokens = response.responses.map((r, idx) => (!r.success ? tokens[idx] : null)).filter((t) => Boolean(t));
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens
    };
  });
exports.sendPushToTokens = sendPushToTokens;
//# sourceMappingURL=fcm.js.map
