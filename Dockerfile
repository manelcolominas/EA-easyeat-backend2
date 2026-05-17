# --- Stage 1: Build ---
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

# 1. Instal·lem sense executar el "postinstall"
RUN npm install --ignore-scripts

# 2. Ara copiem tot el codi (inclòs el tsconfig.json)
COPY . .

# 3. Executem la compilació manualment ara que ja tenim els fitxers
RUN npm run build

# --- Stage 2: Production ---
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Aquí també ignorem scripts per evitar errors de tsc
RUN npm install --only=production --ignore-scripts

# Copiem el build generat
COPY --from=build /app/build ./build

COPY src/data ./src/data

EXPOSE 3000

CMD ["node", "build/server.js"]