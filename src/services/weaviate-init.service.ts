import { getWeaviateClient } from "../config/weaviate";

export async function initWeaviate(): Promise<void> {
  const client = await getWeaviateClient();

  const collections = await client.collections.listAll();

  const restaurantExists = collections.find(
    (c) => c.name === "Restaurant"
  );

  const dishExists = collections.find(
    (c) => c.name === "Dish"
  );

  const reviewExists = collections.find(
    (c) => c.name === "Review"
  );

  const rewardExsist = collections.find(
    (c) => c.name === "Reward"
  );

  if (!restaurantExists) {
    await client.collections.create({
      name: "Restaurant",
      properties: [
        { name: "mongoId", dataType: "text" },
        { name: "name", dataType: "text" },
        { name: "description", dataType: "text" },
        { name: "categories", dataType: "text[]" },
        { name: "globalRating", dataType: "number" },
        { name: "city", dataType: "text" },
        { name: "address", dataType: "text" },
        { name: "latitude", dataType: "number" },
        { name: "longitude", dataType: "number" },
        { name: "phone", dataType: "text" },
        { name: "website", dataType: "text" },
      ],
    });
  }

  if (!dishExists) {
    await client.collections.create({
      name: "Dish",
      properties: [
        { name: "mongoId", dataType: "text" },
        { name: "restaurantMongoId", dataType: "text" },
        { name: "name", dataType: "text" },
        { name: "description", dataType: "text" },
        { name: "section", dataType: "text" },
        { name: "price", dataType: "number" },
        { name: "ingredients", dataType: "text[]" },
        { name: "allergens", dataType: "text[]" },
        { name: "dietaryFlags", dataType: "text[]" },
        { name: "flavorProfile", dataType: "text[]" },
        { name: "cuisineTags", dataType: "text[]" },
        { name: "avgRating", dataType: "number" },
      ]
    });
  }

  if (!reviewExists) {
    await client.collections.create({
      name: "Review",
      properties: [
        { name: "mongoId", dataType: "text" },
        { name: "restaurantMongoId", dataType: "text" },
        { name: "customerMongoId", dataType: "text" },
        { name: "globalRating", dataType: "number" },
        { name: "foodQualityRating", dataType: "number" },
        { name: "staffServiceRating", dataType: "number" },
        { name: "cleanlinessRating", dataType: "number" },
        { name: "environmentRating", dataType: "number" },
        { name: "comment", dataType: "text" },
        { name: "createdAt", dataType: "text" },
      ]
    });
  }

  if (!rewardExsist) {
    await client.collections.create({
      name: "Reward",
      properties: [
        { name: "mongoId", dataType: "text" },
        { name: "restaurantId", dataType: "text" },
        { name: "name", dataType: "text" },
        { name: "description", dataType: "text" },
        { name: "pointsRequired", dataType: "number" },
        { name: "expiry", dataType: "text" },
      ]
    });
  }
}