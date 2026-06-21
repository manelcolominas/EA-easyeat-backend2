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
Object.defineProperty(exports, '__esModule', { value: true });
exports.SERVICE_PERIODS_CONFIG = void 0;
exports.getCurrentServicePeriods = getCurrentServicePeriods;
exports.isRestaurantOpenNow = isRestaurantOpenNow;
exports.getFullMenu = getFullMenu;
exports.getCurrentMenu = getCurrentMenu;
exports.getMenuByPeriod = getMenuByPeriod;
const dish_1 = require('../models/dish');
exports.SERVICE_PERIODS_CONFIG = [
  { period: 'breakfast', start: '03:30', end: '11:30', label: 'Breakfast' },
  { period: 'lunch', start: '11:30', end: '16:30', label: 'Lunch' },
  { period: 'dinner', start: '16:30', end: '03:30', label: 'Dinner' },
  { period: 'all-day', start: '00:00', end: '23:59', label: 'All Day' }
];
const SERVICE_PERIODS = exports.SERVICE_PERIODS_CONFIG; // just rename the import alias
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
function isTimeInCyclicPeriod(currentMinutes, startStr, endStr) {
  const s = timeToMinutes(startStr);
  const e = timeToMinutes(endStr);
  if (s <= e) {
    return currentMinutes >= s && currentMinutes < e;
  } else {
    return currentMinutes >= s || currentMinutes < e;
  }
}
function getCurrentServicePeriods(now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const active = SERVICE_PERIODS.filter(({ start, end }) => isTimeInCyclicPeriod(currentMinutes, start, end)).map((p) => p.period);
  active.push('all-day');
  return [...new Set(active)]; // deduplicate in case all-day was already matched
}
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
function isRestaurantOpenNow(timetable, now = new Date()) {
  if (!timetable) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = DAYS[now.getDay()];
  const todaySlots = timetable[todayStr];
  if (todaySlots) {
    const isOpenToday = todaySlots.some(({ open, close }) => {
      const s = timeToMinutes(open);
      const e = timeToMinutes(close);
      if (s < e) return currentMinutes >= s && currentMinutes < e;
      else return currentMinutes >= s;
    });
    if (isOpenToday) return true;
  }
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayStr = DAYS[yesterdayDate.getDay()];
  const yesterdaySlots = timetable[yesterdayStr];
  if (yesterdaySlots) {
    const isOpenFromYesterday = yesterdaySlots.some(({ open, close }) => {
      const s = timeToMinutes(open);
      const e = timeToMinutes(close);
      if (s >= e) return currentMinutes < e;
      return false;
    });
    if (isOpenFromYesterday) return true;
  }
  return false;
}
// MODE 1 — Full menu, all dishes, each tagged with isAvailableNow for the frontend to grey out
function getFullMenu(restaurant_id_1) {
  return __awaiter(this, arguments, void 0, function* (restaurant_id, now = new Date()) {
    const activePeriods = getCurrentServicePeriods(now);
    const dishes = yield dish_1.DishModel.find({ restaurant_id: restaurant_id, active: true });
    return dishes.map((dish) => {
      var _a, _b;
      return Object.assign(Object.assign({}, dish.toObject()), {
        isAvailableNow: (_b = (_a = dish.availableAt) === null || _a === void 0 ? void 0 : _a.some((p) => activePeriods.includes(p))) !== null && _b !== void 0 ? _b : false
      });
    });
  });
}
// MODE 2 — Only dishes available right now based on current time
function getCurrentMenu(restaurant_id_1) {
  return __awaiter(this, arguments, void 0, function* (restaurant_id, now = new Date()) {
    const activePeriods = getCurrentServicePeriods(now);
    return dish_1.DishModel.find({
      restaurant_id: restaurant_id,
      active: true,
      availableAt: { $in: activePeriods }
    });
  });
}
// MODE 3 — admin manually picks a period to browse
function getMenuByPeriod(restaurant_id, period) {
  return __awaiter(this, void 0, void 0, function* () {
    return dish_1.DishModel.find({
      restaurant_id: restaurant_id,
      active: true,
      availableAt: period
    });
  });
}
//# sourceMappingURL=servicePeriod.js.map
