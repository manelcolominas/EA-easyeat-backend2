import { getWeaviateClient } from "../config/weaviate";
import { generateEmbedding } from "../utils/embedder";
import { IRestaurantWeaviate } from "../models/restaurant";
import { IDishWeaviate } from "../models/dish";
import { IReviewWeaviate } from "../models/review";

function toWeaviateRestaurant(data: IRestaurantWeaviate) {
  const properties: Record<string, any> = {
    mongoId: data.id,
    name: data.name,
    description: data.description,
    categories: data.categories,
    globalRating: data.globalRating,
    city: data.city,
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
    price: data.price,
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
    globalRating: data.globalRating,
  };

  if (data.foodQualityRating !== undefined) properties.foodQualityRating = data.foodQualityRating;
  if (data.staffServiceRating !== undefined) properties.staffServiceRating = data.staffServiceRating;
  if (data.cleanlinessRating !== undefined) properties.cleanlinessRating = data.cleanlinessRating;
  if (data.environmentRating !== undefined) properties.environmentRating = data.environmentRating;
  if (data.comment !== undefined) properties.comment = data.comment;
  if (data.createdAt !== undefined) properties.createdAt = data.createdAt;

  return properties;
}

export async function insertRestaurantVector(
  data: IRestaurantWeaviate
): Promise<void> {
  const text = `${data.name}. ${data.description}. Categories: ${data.categories.join(' ')}. Location: ${data.city}. ${data.address ? data.address + ' (' + data.latitude + ', ' + data.longitude + ')' : ''} ${data.phone ? 'Phone: ' + data.phone + '.' : ''} ${data.website ? 'Website: ' + data.website + '.' : ''}`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = client.collections.use("Restaurant");

  await collection.data.insert({
    properties: toWeaviateRestaurant(data),
    vector: embedding,
  });
}

export async function insertDishVector(
  data: IDishWeaviate
): Promise<void> {
  const text = `${data.name}. ${data.description || ''} Section: ${data.section}. Price: ${data.price}. Ingredients: ${data.ingredients ? data.ingredients.join(' ') : 'N/A'}. Allergens: ${data.allergens ? data.allergens.join(' ') : 'N/A'}. Dietary Flags: ${data.dietaryFlags ? data.dietaryFlags.join(' ') : 'N/A'}. Flavor Profile: ${data.flavorProfile ? data.flavorProfile.join(' ') : 'N/A'}. Cuisine Tags: ${data.cuisineTags ? data.cuisineTags.join(' ') : 'N/A'}. Average Rating: ${data.avgRating !== undefined ? data.avgRating : 'N/A'}.`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = client.collections.use("Dish");

  await collection.data.insert({
    properties: toWeaviateDish(data),
    vector: embedding,
  });
}

export async function insertReviewVector(
  data: IReviewWeaviate
): Promise<void> {
  const text = `Review for restaurant ${data.restaurantId} by customer ${data.customerId}. Global Rating: ${data.globalRating}. Food Quality: ${data.foodQualityRating !== undefined ? data.foodQualityRating : 'N/A'}. Staff Service: ${data.staffServiceRating !== undefined ? data.staffServiceRating : 'N/A'}. Cleanliness: ${data.cleanlinessRating !== undefined ? data.cleanlinessRating : 'N/A'}. Environment: ${data.environmentRating !== undefined ? data.environmentRating : 'N/A'}. Comment: ${data.comment || 'N/A'}. Created At: ${data.createdAt ? data.createdAt.toISOString() : 'N/A'}.`;
  const embedding = await generateEmbedding(text);

  const client = await getWeaviateClient();
  const collection = client.collections.use("Review");

  await collection.data.insert({
    properties: toWeaviateReview(data),
    vector: embedding,
  });
}

export async function searchRestaurants(
  queryEmbedding: number[],
  limit = 5
) {
  const client = await getWeaviateClient();
  const collection = client.collections.use("Restaurant");

  const result = await collection.query.nearVector(queryEmbedding, {
    limit,
  });

  return result.objects;
}

export async function searchDishes(
  queryEmbedding: number[],
  limit = 10
) {
  const client = await getWeaviateClient();
  const collection = client.collections.use("Dish");


  const result = await collection.query.nearVector(queryEmbedding, {
    limit,
  });

  return result.objects;
}

export async function searchReviews(
  queryEmbedding: number[],
  limit = 5
) {
  const client = await getWeaviateClient();
  const collection = client.collections.use("Review");

  const result = await collection.query.nearVector(queryEmbedding, {
    limit,
  });

  return result.objects;
}
