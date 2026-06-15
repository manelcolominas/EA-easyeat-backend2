import { getWeaviateClient } from '../config/weaviate';
import { generateEmbedding } from '../utils/embedder';
import { IRestaurantWeaviate, RestaurantModel } from '../models/restaurant';
import { IDishWeaviate } from '../models/dish';
import { IReviewWeaviate } from '../models/review';
import { IRewardWeaviate } from '../models/reward';
import { CustomerModel } from '../models/customer';

function toWeaviateRestaurant(data: IRestaurantWeaviate) {
  const properties: Record<string, any> = {
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

function toWeaviateDish(data: IDishWeaviate) {
  const properties: Record<string, any> = {
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

function toWeaviateReview(data: IReviewWeaviate) {
  const properties: Record<string, any> = {
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

function toWeaviateReward(data: IRewardWeaviate) {
  const properties: Record<string, any> = {
    mongoId: data.id,
    restaurantId: data.restaurantId,
    name: data.name,
    description: data.description,
    pointsRequired: data.pointsRequired
  };

  if (data.expiry !== undefined) properties.expiry = data.expiry;

  return properties;
}

export async function insertRestaurantVector(data: IRestaurantWeaviate): Promise<void> {
  const text = `${data.name}. ${data.description}. Categories: ${data.categories.join(' ')}. Location: ${data.city}. ${data.address ? data.address + ' (' + data.latitude + ', ' + data.longitude + ')' : ''} ${data.phone ? 'Phone: ' + data.phone + '.' : ''} ${data.website ? 'Website: ' + data.website + '.' : ''}`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = client.collections.use('Restaurant');

  await collection.data.insert({
    properties: toWeaviateRestaurant(data),
    vectors: { default: embedding }
  });
}

export async function insertDishVector(data: IDishWeaviate): Promise<void> {
  const text = `${data.name}. ${data.description || ''} Section: ${data.section}. Price: ${data.price}. Ingredients: ${data.ingredients ? data.ingredients.join(' ') : 'N/A'}. Allergens: ${data.allergens ? data.allergens.join(' ') : 'N/A'}. Dietary Flags: ${data.dietaryFlags ? data.dietaryFlags.join(' ') : 'N/A'}. Flavor Profile: ${data.flavorProfile ? data.flavorProfile.join(' ') : 'N/A'}. Cuisine Tags: ${data.cuisineTags ? data.cuisineTags.join(' ') : 'N/A'}. Average Rating: ${data.avgRating !== undefined ? data.avgRating : 'N/A'}.`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = client.collections.use('Dish');

  await collection.data.insert({
    properties: toWeaviateDish(data),
    vectors: { default: embedding }
  });
}

export async function insertReviewVector(data: IReviewWeaviate): Promise<void> {
  const text = `Review for restaurant ${data.restaurantId} by customer ${data.customerId}. Global Rating: ${data.globalRating}. Food Quality: ${data.foodQualityRating !== undefined ? data.foodQualityRating : 'N/A'}. Staff Service: ${data.staffServiceRating !== undefined ? data.staffServiceRating : 'N/A'}. Cleanliness: ${data.cleanlinessRating !== undefined ? data.cleanlinessRating : 'N/A'}. Environment: ${data.environmentRating !== undefined ? data.environmentRating : 'N/A'}. Comment: ${data.comment || 'N/A'}. Created At: ${data.createdAt ? data.createdAt.toISOString() : 'N/A'}.`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = client.collections.use('Review');

  await collection.data.insert({
    properties: toWeaviateReview(data),
    vectors: { default: embedding }
  });
}

export async function insertRewardVector(data: IRewardWeaviate): Promise<void> {
  const text = `${data.name}. ${data.description}. Reward from restaurant ${data.restaurantId}. Required points: ${data.pointsRequired}. Expiration date: ${data.expiry !== undefined ? data.expiry : 'N/A'}`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = client.collections.use('Reward');

  await collection.data.insert({
    properties: toWeaviateReward(data),
    vectors: { default: embedding }
  });
}

export async function updateRestaurantVector(id: string, data: IRestaurantWeaviate): Promise<void> {
  const text = `${data.name}. ${data.description}. Categories: ${data.categories.join(' ')}. Location: ${data.city}. ${data.address ? data.address + ' (' + data.latitude + ', ' + data.longitude + ')' : ''} ${data.phone ? 'Phone: ' + data.phone + '.' : ''} ${data.website ? 'Website: ' + data.website + '.' : ''}`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = await client.collections.use('Restaurant');
  const restaurant = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.update({
    id: restaurant.objects[0].uuid,
    properties: toWeaviateRestaurant(data),
    vectors: { default: embedding }
  });
}

export async function updateDishVector(id: string, data: IDishWeaviate): Promise<void> {
  const text = `${data.name}. ${data.description || ''} Section: ${data.section}. Price: ${data.price}. Ingredients: ${data.ingredients ? data.ingredients.join(' ') : 'N/A'}. Allergens: ${data.allergens ? data.allergens.join(' ') : 'N/A'}. Dietary Flags: ${data.dietaryFlags ? data.dietaryFlags.join(' ') : 'N/A'}. Flavor Profile: ${data.flavorProfile ? data.flavorProfile.join(' ') : 'N/A'}. Cuisine Tags: ${data.cuisineTags ? data.cuisineTags.join(' ') : 'N/A'}. Average Rating: ${data.avgRating !== undefined ? data.avgRating : 'N/A'}.`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = await client.collections.use('Restaurant');
  const restaurant = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.update({
    id: restaurant.objects[0].uuid,
    properties: toWeaviateDish(data),
    vectors: { default: embedding }
  });
}

export async function updateReviewVector(id: string, data: IReviewWeaviate): Promise<void> {
  const text = `Review for restaurant ${data.restaurantId} by customer ${data.customerId}. Global Rating: ${data.globalRating}. Food Quality: ${data.foodQualityRating !== undefined ? data.foodQualityRating : 'N/A'}. Staff Service: ${data.staffServiceRating !== undefined ? data.staffServiceRating : 'N/A'}. Cleanliness: ${data.cleanlinessRating !== undefined ? data.cleanlinessRating : 'N/A'}. Environment: ${data.environmentRating !== undefined ? data.environmentRating : 'N/A'}. Comment: ${data.comment || 'N/A'}. Created At: ${data.createdAt ? data.createdAt.toISOString() : 'N/A'}.`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = await client.collections.use('Restaurant');
  const restaurant = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.update({
    id: restaurant.objects[0].uuid,
    properties: toWeaviateReview(data),
    vectors: { default: embedding }
  });
}

export async function updateRewardVector(id: string, data: IRewardWeaviate): Promise<void> {
  const text = `${data.name}. ${data.description}. Reward from restaurant ${data.restaurantId}. Required points: ${data.pointsRequired}. Expiration date: ${data.expiry !== undefined ? data.expiry : 'N/A'}`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = await client.collections.use('Restaurant');
  const restaurant = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.update({
    id: restaurant.objects[0].uuid,
    properties: toWeaviateReward(data),
    vectors: { default: embedding }
  });
}

async function resolveIdsToNames(properties: Record<string, any>): Promise<Record<string, any>> {
  const data = { ...properties };

  // Handle restaurantId or restaurant_id
  const restaurantId = data.restaurantId || data.restaurant_id;
  if (restaurantId) {
    try {
      const restaurant = await RestaurantModel.findById(restaurantId).lean();
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
      const customer = await CustomerModel.findById(customerId).lean();
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
}

export async function searchRestaurants(queryEmbedding: number[], limit: number = 5): Promise<Record<string, any>[]> {
  const client = await getWeaviateClient();
  const collection = client.collections.use('Restaurant');

  const result = await collection.query.nearVector(queryEmbedding, {
    limit
  });

  return Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));
}

/**
 * Returns restaurant data from Weaviate for the given list of MongoDB ObjectId strings.
 * Used to ensure all restaurants referenced in dishes/reviews/rewards appear in the LLM context.
 */
export async function getRestaurantsByMongoIds(mongoIds: string[]): Promise<Record<string, any>[]> {
  if (mongoIds.length === 0) return [];

  const client = await getWeaviateClient();
  const collection = client.collections.use('Restaurant');

  // Fetch each restaurant individually and collect unique results
  const seen = new Set<string>();
  const results: Record<string, any>[] = [];

  for (const mongoId of mongoIds) {
    if (seen.has(mongoId)) continue;
    seen.add(mongoId);
    try {
      const result = await collection.query.fetchObjects({
        filters: collection.filter.byProperty('mongoId').equal(mongoId),
        limit: 1
      });
      if (result.objects.length > 0) {
        const resolved = await resolveIdsToNames(result.objects[0].properties);
        results.push(resolved);
      }
    } catch {
      // skip missing restaurants
    }
  }

  return results;
}

export async function searchDishes(queryEmbedding: number[], limit: number = 10): Promise<{ resolved: Record<string, any>[]; restaurantIds: string[] }> {
  const client = await getWeaviateClient();
  const collection = client.collections.use('Dish');

  const result = await collection.query.nearVector(queryEmbedding, {
    limit
  });

  const restaurantIds = result.objects.map((obj) => obj.properties.restaurantId as string).filter((id): id is string => typeof id === 'string' && id.length > 0);

  const resolved = await Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));

  return { resolved, restaurantIds };
}

export async function searchReviews(queryEmbedding: number[], limit: number = 5): Promise<{ resolved: Record<string, any>[]; restaurantIds: string[] }> {
  const client = await getWeaviateClient();
  const collection = client.collections.use('Review');

  const result = await collection.query.nearVector(queryEmbedding, {
    limit
  });

  const restaurantIds = result.objects.map((obj) => obj.properties.restaurantId as string).filter((id): id is string => typeof id === 'string' && id.length > 0);

  const resolved = await Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));

  return { resolved, restaurantIds };
}

export async function searchRewards(queryEmbedding: number[], limit: number = 5): Promise<{ resolved: Record<string, any>[]; restaurantIds: string[] }> {
  const client = await getWeaviateClient();
  const collection = client.collections.use('Reward');

  const result = await collection.query.nearVector(queryEmbedding, {
    limit
  });

  const restaurantIds = result.objects.map((obj) => obj.properties.restaurantId as string).filter((id): id is string => typeof id === 'string' && id.length > 0);

  const resolved = await Promise.all(result.objects.map((obj) => resolveIdsToNames(obj.properties)));

  return { resolved, restaurantIds };
}

export async function deleteRestaurantVector(id: string): Promise<void> {
  const client = await getWeaviateClient();
  const collection = await client.collections.use('Restaurant');
  const restaurant = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.deleteById(restaurant.objects[0].uuid);
}

export async function deleteDishVector(id: string): Promise<void> {
  const client = await getWeaviateClient();
  const collection = await client.collections.use('Dish');
  const dish = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.deleteById(dish.objects[0].uuid);
}

export async function deleteReviewVector(id: string): Promise<void> {
  const client = await getWeaviateClient();
  const collection = await client.collections.use('Review');
  const review = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.deleteById(review.objects[0].uuid);
}

export async function deleteRewardVector(id: string): Promise<void> {
  const client = await getWeaviateClient();
  const collection = await client.collections.use('Reward');
  const reward = await collection.query.fetchObjects({
    filters: collection.filter.byProperty('mongoId').equal(id)
  });

  await collection.data.deleteById(reward.objects[0].uuid);
}
