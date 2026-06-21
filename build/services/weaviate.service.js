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
exports.insertRestaurantVector = insertRestaurantVector;
exports.insertDishVector = insertDishVector;
exports.insertReviewVector = insertReviewVector;
exports.insertRewardVector = insertRewardVector;
exports.updateRestaurantVector = updateRestaurantVector;
exports.updateDishVector = updateDishVector;
exports.updateReviewVector = updateReviewVector;
exports.updateRewardVector = updateRewardVector;
exports.searchRestaurants = searchRestaurants;
exports.getRestaurantsByMongoIds = getRestaurantsByMongoIds;
exports.searchDishes = searchDishes;
exports.searchReviews = searchReviews;
exports.searchRewards = searchRewards;
exports.deleteRestaurantVector = deleteRestaurantVector;
exports.deleteDishVector = deleteDishVector;
exports.deleteReviewVector = deleteReviewVector;
exports.deleteRewardVector = deleteRewardVector;
const weaviate_1 = require('../config/weaviate');
const embedder_1 = require('../utils/embedder');
const restaurant_1 = require('../models/restaurant');
const customer_1 = require('../models/customer');
function toWeaviateRestaurant(data) {
  const properties = {
    mongoId: data.id,
    name: data.name,
    description: data.description,
    categories: data.categories,
    globalRating: data.globalRating,
    city: data.city
  };
  if (data.address !== undefined) properties.address = data.address;
  if (data.latitude !== undefined) properties.latitude = data.latitude;
  if (data.longitude !== undefined) properties.longitude = data.longitude;
  if (data.phone !== undefined) properties.phone = data.phone;
  if (data.website !== undefined) properties.website = data.website;
  return properties;
}
function toWeaviateDish(data) {
  const properties = {
    mongoId: data.id,
    restaurantId: data.restaurantId,
    name: data.name,
    section: data.section,
    price: data.price
  };
  if (data.description !== undefined) properties.description = data.description;
  if (data.ingredients !== undefined) properties.ingredients = data.ingredients;
  if (data.allergens !== undefined) properties.allergens = data.allergens;
  if (data.dietaryFlags !== undefined) properties.dietaryFlags = data.dietaryFlags;
  if (data.flavorProfile !== undefined) properties.flavorProfile = data.flavorProfile;
  if (data.cuisineTags !== undefined) properties.cuisineTags = data.cuisineTags;
  if (data.avgRating !== undefined) properties.avgRating = data.avgRating;
  return properties;
}
function toWeaviateReview(data) {
  const properties = {
    mongoId: data.id,
    restaurantId: data.restaurantId,
    customerId: data.customerId,
    globalRating: data.globalRating
  };
  if (data.foodQualityRating !== undefined) properties.foodQualityRating = data.foodQualityRating;
  if (data.staffServiceRating !== undefined) properties.staffServiceRating = data.staffServiceRating;
  if (data.cleanlinessRating !== undefined) properties.cleanlinessRating = data.cleanlinessRating;
  if (data.environmentRating !== undefined) properties.environmentRating = data.environmentRating;
  if (data.comment !== undefined) properties.comment = data.comment;
  if (data.createdAt !== undefined) properties.createdAt = data.createdAt;
  return properties;
}
function toWeaviateReward(data) {
  const properties = {
    mongoId: data.id,
    restaurantId: data.restaurantId,
    name: data.name,
    description: data.description,
    pointsRequired: data.pointsRequired
  };
  if (data.expiry !== undefined) properties.expiry = data.expiry;
  return properties;
}
function insertRestaurantVector(data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `${data.name}. ${data.description}. Categories: ${data.categories.join(' ')}. Location: ${data.city}. ${data.address ? data.address + ' (' + data.latitude + ', ' + data.longitude + ')' : ''} ${data.phone ? 'Phone: ' + data.phone + '.' : ''} ${data.website ? 'Website: ' + data.website + '.' : ''}`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Restaurant');
    yield collection.data.insert({
      properties: toWeaviateRestaurant(data),
      vectors: { default: embedding }
    });
  });
}
function insertDishVector(data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `${data.name}. ${data.description || ''} Section: ${data.section}. Price: ${data.price}. Ingredients: ${data.ingredients ? data.ingredients.join(' ') : 'N/A'}. Allergens: ${data.allergens ? data.allergens.join(' ') : 'N/A'}. Dietary Flags: ${data.dietaryFlags ? data.dietaryFlags.join(' ') : 'N/A'}. Flavor Profile: ${data.flavorProfile ? data.flavorProfile.join(' ') : 'N/A'}. Cuisine Tags: ${data.cuisineTags ? data.cuisineTags.join(' ') : 'N/A'}. Average Rating: ${data.avgRating !== undefined ? data.avgRating : 'N/A'}.`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Dish');
    yield collection.data.insert({
      properties: toWeaviateDish(data),
      vectors: { default: embedding }
    });
  });
}
function insertReviewVector(data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `Review for restaurant ${data.restaurantId} by customer ${data.customerId}. Global Rating: ${data.globalRating}. Food Quality: ${data.foodQualityRating !== undefined ? data.foodQualityRating : 'N/A'}. Staff Service: ${data.staffServiceRating !== undefined ? data.staffServiceRating : 'N/A'}. Cleanliness: ${data.cleanlinessRating !== undefined ? data.cleanlinessRating : 'N/A'}. Environment: ${data.environmentRating !== undefined ? data.environmentRating : 'N/A'}. Comment: ${data.comment || 'N/A'}. Created At: ${data.createdAt ? data.createdAt.toISOString() : 'N/A'}.`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Review');
    yield collection.data.insert({
      properties: toWeaviateReview(data),
      vectors: { default: embedding }
    });
  });
}
function insertRewardVector(data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `${data.name}. ${data.description}. Reward from restaurant ${data.restaurantId}. Required points: ${data.pointsRequired}. Expiration date: ${data.expiry !== undefined ? data.expiry : 'N/A'}`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Reward');
    yield collection.data.insert({
      properties: toWeaviateReward(data),
      vectors: { default: embedding }
    });
  });
}
function updateRestaurantVector(id, data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `${data.name}. ${data.description}. Categories: ${data.categories.join(' ')}. Location: ${data.city}. ${data.address ? data.address + ' (' + data.latitude + ', ' + data.longitude + ')' : ''} ${data.phone ? 'Phone: ' + data.phone + '.' : ''} ${data.website ? 'Website: ' + data.website + '.' : ''}`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Restaurant');
    const restaurant = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.update({
      id: restaurant.objects[0].uuid,
      properties: toWeaviateRestaurant(data),
      vectors: { default: embedding }
    });
  });
}
function updateDishVector(id, data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `${data.name}. ${data.description || ''} Section: ${data.section}. Price: ${data.price}. Ingredients: ${data.ingredients ? data.ingredients.join(' ') : 'N/A'}. Allergens: ${data.allergens ? data.allergens.join(' ') : 'N/A'}. Dietary Flags: ${data.dietaryFlags ? data.dietaryFlags.join(' ') : 'N/A'}. Flavor Profile: ${data.flavorProfile ? data.flavorProfile.join(' ') : 'N/A'}. Cuisine Tags: ${data.cuisineTags ? data.cuisineTags.join(' ') : 'N/A'}. Average Rating: ${data.avgRating !== undefined ? data.avgRating : 'N/A'}.`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Restaurant');
    const restaurant = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.update({
      id: restaurant.objects[0].uuid,
      properties: toWeaviateDish(data),
      vectors: { default: embedding }
    });
  });
}
function updateReviewVector(id, data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `Review for restaurant ${data.restaurantId} by customer ${data.customerId}. Global Rating: ${data.globalRating}. Food Quality: ${data.foodQualityRating !== undefined ? data.foodQualityRating : 'N/A'}. Staff Service: ${data.staffServiceRating !== undefined ? data.staffServiceRating : 'N/A'}. Cleanliness: ${data.cleanlinessRating !== undefined ? data.cleanlinessRating : 'N/A'}. Environment: ${data.environmentRating !== undefined ? data.environmentRating : 'N/A'}. Comment: ${data.comment || 'N/A'}. Created At: ${data.createdAt ? data.createdAt.toISOString() : 'N/A'}.`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Restaurant');
    const restaurant = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.update({
      id: restaurant.objects[0].uuid,
      properties: toWeaviateReview(data),
      vectors: { default: embedding }
    });
  });
}
function updateRewardVector(id, data) {
  return __awaiter(this, void 0, void 0, function* () {
    const text = `${data.name}. ${data.description}. Reward from restaurant ${data.restaurantId}. Required points: ${data.pointsRequired}. Expiration date: ${data.expiry !== undefined ? data.expiry : 'N/A'}`;
    const embedding = yield (0, embedder_1.generateEmbedding)(text);
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Restaurant');
    const restaurant = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.update({
      id: restaurant.objects[0].uuid,
      properties: toWeaviateReward(data),
      vectors: { default: embedding }
    });
  });
}
function resolveIdsToNames(properties) {
  return __awaiter(this, void 0, void 0, function* () {
    const data = Object.assign({}, properties);
    // Handle restaurantId or restaurant_id
    const restaurantId = data.restaurantId || data.restaurant_id;
    if (restaurantId) {
      try {
        const restaurant = yield restaurant_1.RestaurantModel.findById(restaurantId).lean();
        if (restaurant && restaurant.profile && restaurant.profile.name) {
          if (data.restaurantId !== undefined) {
            data.restaurantId = restaurant.profile.name;
          }
          if (data.restaurant_id !== undefined) {
            data.restaurant_id = restaurant.profile.name;
          }
        }
      } catch (error) {
        // Ignore or log error
      }
    }
    // Handle customerId or customer_id
    const customerId = data.customerId || data.customer_id;
    if (customerId) {
      try {
        const customer = yield customer_1.CustomerModel.findById(customerId).lean();
        if (customer && customer.name) {
          if (data.customerId !== undefined) {
            data.customerId = customer.name;
          }
          if (data.customer_id !== undefined) {
            data.customer_id = customer.name;
          }
        }
      } catch (error) {
        // Ignore or log error
      }
    }
    return data;
  });
}
function searchRestaurants(queryEmbedding_1) {
  return __awaiter(this, arguments, void 0, function* (queryEmbedding, limit = 5) {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Restaurant');
    const result = yield collection.query.nearVector(queryEmbedding, {
      limit
    });
    return Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));
  });
}
/**
 * Returns restaurant data from Weaviate for the given list of MongoDB ObjectId strings.
 * Used to ensure all restaurants referenced in dishes/reviews/rewards appear in the LLM context.
 */
function getRestaurantsByMongoIds(mongoIds) {
  return __awaiter(this, void 0, void 0, function* () {
    if (mongoIds.length === 0) return [];
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Restaurant');
    // Fetch each restaurant individually and collect unique results
    const seen = new Set();
    const results = [];
    for (const mongoId of mongoIds) {
      if (seen.has(mongoId)) continue;
      seen.add(mongoId);
      try {
        const result = yield collection.query.fetchObjects({
          filters: collection.filter.byProperty('mongoId').equal(mongoId),
          limit: 1
        });
        if (result.objects.length > 0) {
          const resolved = yield resolveIdsToNames(result.objects[0].properties);
          results.push(resolved);
        }
      } catch (_a) {
        // skip missing restaurants
      }
    }
    return results;
  });
}
function searchDishes(queryEmbedding_1) {
  return __awaiter(this, arguments, void 0, function* (queryEmbedding, limit = 10) {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Dish');
    const result = yield collection.query.nearVector(queryEmbedding, {
      limit
    });
    const restaurantIds = result.objects.map((obj) => obj.properties.restaurantId).filter((id) => typeof id === 'string' && id.length > 0);
    const resolved = yield Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));
    return { resolved, restaurantIds };
  });
}
function searchReviews(queryEmbedding_1) {
  return __awaiter(this, arguments, void 0, function* (queryEmbedding, limit = 5) {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Review');
    const result = yield collection.query.nearVector(queryEmbedding, {
      limit
    });
    const restaurantIds = result.objects.map((obj) => obj.properties.restaurantId).filter((id) => typeof id === 'string' && id.length > 0);
    const resolved = yield Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));
    return { resolved, restaurantIds };
  });
}
function searchRewards(queryEmbedding_1) {
  return __awaiter(this, arguments, void 0, function* (queryEmbedding, limit = 5) {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = client.collections.use('Reward');
    const result = yield collection.query.nearVector(queryEmbedding, {
      limit
    });
    const restaurantIds = result.objects.map((obj) => obj.properties.restaurantId).filter((id) => typeof id === 'string' && id.length > 0);
    const resolved = yield Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));
    return { resolved, restaurantIds };
  });
}
function deleteRestaurantVector(id) {
  return __awaiter(this, void 0, void 0, function* () {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Restaurant');
    const restaurant = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.deleteById(restaurant.objects[0].uuid);
  });
}
function deleteDishVector(id) {
  return __awaiter(this, void 0, void 0, function* () {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Dish');
    const dish = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.deleteById(dish.objects[0].uuid);
  });
}
function deleteReviewVector(id) {
  return __awaiter(this, void 0, void 0, function* () {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Review');
    const review = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.deleteById(review.objects[0].uuid);
  });
}
function deleteRewardVector(id) {
  return __awaiter(this, void 0, void 0, function* () {
    const client = yield (0, weaviate_1.getWeaviateClient)();
    const collection = yield client.collections.use('Reward');
    const reward = yield collection.query.fetchObjects({
      filters: collection.filter.byProperty('mongoId').equal(id)
    });
    yield collection.data.deleteById(reward.objects[0].uuid);
  });
}
//# sourceMappingURL=weaviate.service.js.map
