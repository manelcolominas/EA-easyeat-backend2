'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
const chalk_1 = __importDefault(require('chalk'));
class Logging {}
_a = Logging;
Logging.log = (...args) => _a.info(...args);
Logging.info = (...args) => console.log(chalk_1.default.blue(`[${new Date().toLocaleString()}] [INFO]`), ...args.map((arg) => (typeof arg === 'string' ? chalk_1.default.blueBright(arg) : arg)));
Logging.warning = (...args) =>
  console.log(chalk_1.default.yellow(`[${new Date().toLocaleString()}] [WARN]`), ...args.map((arg) => (typeof arg === 'string' ? chalk_1.default.yellowBright(arg) : arg)));
Logging.error = (...args) => console.log(chalk_1.default.red(`[${new Date().toLocaleString()}] [ERROR]`), ...args.map((arg) => (typeof arg === 'string' ? chalk_1.default.redBright(arg) : arg)));
exports.default = Logging;
//# sourceMappingURL=logging.js.map
