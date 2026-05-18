import fs from 'fs';

type Coordinates = {
  type: 'Point';
  coordinates: [number, number]; // [lon, lat]
};

interface Restaurant {
  _id: string;
  profile: {
    name: string;
    location: {
      coordinates: Coordinates;
    };
  };
}

// ─────────────────────────────
// Helpers geoespacials
// ─────────────────────────────

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Punt destí donat distància i bearing
 */
function destinationPoint(lat: number, lon: number, distanceMeters: number, bearingDeg: number): [number, number] {
  const R = 6371e3;

  const bearing = toRad(bearingDeg);
  const lat1 = toRad(lat);
  const lon1 = toRad(lon);

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distanceMeters / R) + Math.cos(lat1) * Math.sin(distanceMeters / R) * Math.cos(bearing));

  const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(distanceMeters / R) * Math.cos(lat1), Math.cos(distanceMeters / R) - Math.sin(lat1) * Math.sin(lat2));

  return [toDeg(lon2), toDeg(lat2)];
}

/**
 * Random dins un rang
 */
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ─────────────────────────────
// Redistribució realista
// ─────────────────────────────

function redistributeRestaurants(restaurants: Restaurant[], baseLat: number, baseLon: number, minRadius: number, maxRadius: number): Restaurant[] {
  return restaurants.map((r) => {
    // 🎯 distància variable (NO fixa)
    const distance = rand(minRadius, maxRadius);

    // 🧭 direcció aleatòria
    const bearing = rand(0, 360);

    let [lon, lat] = destinationPoint(baseLat, baseLon, distance, bearing);

    // 📌 jitter final (simula errors GPS / ubicació real)
    const jitter = 0.00005; // ~5–10 metres
    lat += rand(-jitter, jitter);
    lon += rand(-jitter, jitter);

    return {
      ...r,
      profile: {
        ...r.profile,
        location: {
          ...r.profile.location,
          coordinates: {
            type: 'Point',
            coordinates: [lon, lat]
          }
        }
      }
    };
  });
}

// ─────────────────────────────
// EXECUCIÓ
// ─────────────────────────────

const inputPath = 'src/data/restaurants.json';
const outputPath = './restaurants.updated.json';

const baseLat = 41.274916;
const baseLon = 1.9861807;

// 📏 rang realista (ex: ciutat petita / barri)
const minRadius = 80; // metres
const maxRadius = 600; // metres

const raw = fs.readFileSync(inputPath, 'utf-8');
const restaurants: Restaurant[] = JSON.parse(raw);

const updated = redistributeRestaurants(restaurants, baseLat, baseLon, minRadius, maxRadius);

fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2));

console.log('✔ Restaurants distribuïts de forma realista');
