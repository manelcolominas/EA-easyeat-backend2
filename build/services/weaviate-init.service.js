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
exports.initWeaviate = initWeaviate;
const weaviate_1 = require('../config/weaviate');
function initWeaviate() {
  return __awaiter(this, void 0, void 0, function* () {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collections = yield client.collections.listAll();
    const restaurantExists = collections.find((c) => c.name === 'Restaurant');
    const dishExists = collections.find((c) => c.name === 'Dish');
    const reviewExists = collections.find((c) => c.name === 'Review');
    const rewardExsist = collections.find((c) => c.name === 'Reward');
    if (!restaurantExists) {
      yield client.collections.create({
        name: 'Restaurant',
        properties: [
          { name: 'mongoId', dataType: 'text' },
          { name: 'name', dataType: 'text' },
          { name: 'description', dataType: 'text' },
          { name: 'categories', dataType: 'text[]' },
          { name: 'globalRating', dataType: 'number' },
          { name: 'city', dataType: 'text' },
          { name: 'address', dataType: 'text' },
          { name: 'latitude', dataType: 'number' },
          { name: 'longitude', dataType: 'number' },
          { name: 'phone', dataType: 'text' },
          { name: 'website', dataType: 'text' }
        ]
      });
    }
    if (!dishExists) {
      yield client.collections.create({
        name: 'Dish',
        properties: [
          { name: 'mongoId', dataType: 'text' },
          { name: 'restaurantMongoId', dataType: 'text' },
          { name: 'name', dataType: 'text' },
          { name: 'description', dataType: 'text' },
          { name: 'section', dataType: 'text' },
          { name: 'price', dataType: 'number' },
          { name: 'ingredients', dataType: 'text[]' },
          { name: 'allergens', dataType: 'text[]' },
          { name: 'dietaryFlags', dataType: 'text[]' },
          { name: 'flavorProfile', dataType: 'text[]' },
          { name: 'cuisineTags', dataType: 'text[]' },
          { name: 'avgRating', dataType: 'number' }
        ]
      });
    }
    if (!reviewExists) {
      yield client.collections.create({
        name: 'Review',
        properties: [
          { name: 'mongoId', dataType: 'text' },
          { name: 'restaurantMongoId', dataType: 'text' },
          { name: 'customerMongoId', dataType: 'text' },
          { name: 'globalRating', dataType: 'number' },
          { name: 'foodQualityRating', dataType: 'number' },
          { name: 'staffServiceRating', dataType: 'number' },
          { name: 'cleanlinessRating', dataType: 'number' },
          { name: 'environmentRating', dataType: 'number' },
          { name: 'comment', dataType: 'text' },
          { name: 'createdAt', dataType: 'text' }
        ]
      });
    }
    if (!rewardExsist) {
      yield client.collections.create({
        name: 'Reward',
        properties: [
          { name: 'mongoId', dataType: 'text' },
          { name: 'restaurantId', dataType: 'text' },
          { name: 'name', dataType: 'text' },
          { name: 'description', dataType: 'text' },
          { name: 'pointsRequired', dataType: 'number' },
          { name: 'expiry', dataType: 'text' }
        ]
      });
    }
  });
}
//# sourceMappingURL=weaviate-init.service.js.map
