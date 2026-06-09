// src/config/weaviate.ts

import weaviate, { WeaviateClient } from 'weaviate-client';

let client: WeaviateClient | null = null;

export async function getWeaviateClient(): Promise<WeaviateClient> {
  if (client) return client;

  client = await weaviate.connectToLocal({
    host: 'localhost',
    port: 8080
  });

  return client;
}
