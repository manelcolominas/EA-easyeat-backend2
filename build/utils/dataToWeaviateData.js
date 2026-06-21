'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.restaurantToWeaviate = restaurantToWeaviate;
exports.dishToWeaviate = dishToWeaviate;
exports.reviewToWeaviate = reviewToWeaviate;
exports.rewardToWeaviate = rewardToWeaviate;
function restaurantToWeaviate(data) {
  var _a;
  const result = {};
  if (data._id) {
    result.id = data._id.toString();
  }
  if (data.profile) {
    if (data.profile.name !== undefined) result.name = data.profile.name;
    if (data.profile.description !== undefined) result.description = data.profile.description;
    if (data.profile.category !== undefined) result.categories = data.profile.category;
    if (data.profile.globalRating !== undefined) result.globalRating = data.profile.globalRating;
    if (data.profile.location) {
      if (data.profile.location.city !== undefined) result.city = data.profile.location.city;
      if (data.profile.location.address !== undefined) result.address = data.profile.location.address;
      if ((_a = data.profile.location.coordinates) === null || _a === void 0 ? void 0 : _a.coordinates) {
        result.longitude = data.profile.location.coordinates.coordinates[0];
        result.latitude = data.profile.location.coordinates.coordinates[1];
      }
    }
    if (data.profile.contact) {
      if (data.profile.contact.phone !== undefined) result.phone = data.profile.contact.phone;
      if (data.profile.contact.website !== undefined) result.website = data.profile.contact.website;
    }
  }
  return result;
}
function dishToWeaviate(data) {
  const result = {};
  if (data._id) {
    result.id = data._id.toString();
  }
  if (data.restaurant_id) {
    result.restaurantId = data.restaurant_id.toString();
  }
  if (data.name !== undefined) result.name = data.name;
  if (data.description !== undefined) result.description = data.description;
  if (data.section !== undefined) result.section = data.section;
  if (data.price !== undefined) result.price = data.price;
  if (data.ingredients !== undefined) result.ingredients = data.ingredients;
  if (data.allergens !== undefined) result.allergens = data.allergens;
  if (data.dietaryFlags !== undefined) result.dietaryFlags = data.dietaryFlags;
  if (data.flavorProfile !== undefined) result.flavorProfile = data.flavorProfile;
  if (data.cuisineTags !== undefined) result.cuisineTags = data.cuisineTags;
  if (data.avgRating !== undefined) result.avgRating = data.avgRating;
  return result;
}
function reviewToWeaviate(data) {
  const result = {};
  if (data._id) {
    result.id = data._id.toString();
  }
  if (data.restaurant_id) {
    result.restaurantId = data.restaurant_id.toString();
  }
  if (data.customer_id) {
    result.customerId = data.customer_id.toString();
  }
  if (data.globalRating !== undefined) result.globalRating = data.globalRating;
  if (data.ratings) {
    if (data.ratings.foodQuality !== undefined) result.foodQualityRating = data.ratings.foodQuality;
    if (data.ratings.staffService !== undefined) result.staffServiceRating = data.ratings.staffService;
    if (data.ratings.cleanliness !== undefined) result.cleanlinessRating = data.ratings.cleanliness;
    if (data.ratings.environment !== undefined) result.environmentRating = data.ratings.environment;
  }
  if (data.comment !== undefined) result.comment = data.comment;
  if (data.createdAt !== undefined) result.createdAt = data.createdAt;
  return result;
}
function rewardToWeaviate(data) {
  const result = {};
  if (data._id) {
    result.id = data._id.toString();
  }
  if (data.restaurant_id) {
    result.restaurantId = data.restaurant_id.toString();
  }
  if (data.name !== undefined) result.name = data.name;
  if (data.description !== undefined) result.description = data.description;
  if (data.pointsRequired !== undefined) result.pointsRequired = data.pointsRequired;
  if (data.expiry !== undefined) {
    result.expiry = data.expiry instanceof Date ? data.expiry.toISOString() : new Date(data.expiry).toISOString();
  }
  return result;
}
//# sourceMappingURL=dataToWeaviateData.js.map
