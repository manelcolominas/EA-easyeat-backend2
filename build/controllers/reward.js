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
const reward_1 = __importDefault(require('../services/reward'));
const pagination_1 = require('../utils/pagination');
const createReward = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const savedReward = yield reward_1.default.createReward(req.body);
      return res.status(201).json(savedReward);
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readReward = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const reward_id = req.params.reward_id;
    try {
      const reward = yield reward_1.default.getReward(reward_id);
      return reward ? res.status(200).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readDeletedReward = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const reward_id = req.params.reward_id;
    try {
      const reward = yield reward_1.default.getDeletedReward(reward_id);
      return reward ? res.status(200).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readAll = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { rewards, total } = yield reward_1.default.getAllRewards(skip, limit);
      return res.status(200).json({
        data: rewards,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readAllDeleted = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { rewards, total } = yield reward_1.default.getAllDeletedRewards(skip, limit);
      return res.status(200).json({
        data: rewards,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readByRestaurant = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { restaurant_id } = req.params;
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { rewards, total } = yield reward_1.default.getByRestaurant(restaurant_id, skip, limit);
      return res.status(200).json({
        data: rewards,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const readDeletedByRestaurant = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { restaurant_id } = req.params;
      const { page, limit, skip } = (0, pagination_1.getPaginationOptions)(req.query);
      const { rewards, total } = yield reward_1.default.getDeletedByRestaurant(restaurant_id, skip, limit);
      return res.status(200).json({
        data: rewards,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const updateReward = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const reward_id = req.params.reward_id;
    try {
      const updatedReward = yield reward_1.default.updateReward(reward_id, req.body);
      return updatedReward ? res.status(201).json(updatedReward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const softDeleteReward = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const reward_id = req.params.reward_id;
    try {
      const reward = yield reward_1.default.softDeleteReward(reward_id);
      return reward ? res.status(201).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const restoreReward = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const reward_id = req.params.reward_id;
    try {
      const reward = yield reward_1.default.restoreReward(reward_id);
      return reward ? res.status(201).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
const hardDeleteReward = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const reward_id = req.params.reward_id;
    try {
      const reward = yield reward_1.default.hardDeleteReward(reward_id);
      return reward ? res.status(201).json(reward) : res.status(404).json({ message: 'not found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
exports.default = {
  createReward,
  readReward,
  readDeletedReward,
  readAll,
  readAllDeleted,
  readByRestaurant,
  readDeletedByRestaurant,
  updateReward,
  softDeleteReward,
  restoreReward,
  hardDeleteReward
};
//# sourceMappingURL=reward.js.map
