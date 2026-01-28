import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

/**
 * Validate latitude & longitude
 */
const isValidCoord = (lat, lng) => {
  return (
    lat !== undefined &&
    lng !== undefined &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Haversine distance (km)
 */
const toRad = (value) => (value * Math.PI) / 180;

export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in KM
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * 🚗 Get Route Info (TomTom Routing API)
 */
export const getRouteInfo = async (origin, destination) => {
  try {
    if (
      !isValidCoord(origin?.lat, origin?.lng) ||
      !isValidCoord(destination?.lat, destination?.lng)
    ) {
      console.error("Invalid coordinates:", { origin, destination });
      return null;
    }

    if (!TOMTOM_API_KEY) {
      console.error("TOMTOM_API_KEY missing in .env file");
      return null;
    }

    const url = `https://api.tomtom.com/routing/1/calculateRoute/${origin.lat},${origin.lng}:${destination.lat},${destination.lng}/json`;

    const response = await axios.get(url, {
      params: {
        key: TOMTOM_API_KEY,
        travelMode: "car",
        traffic: true,
        routeType: "fastest",
      },
      timeout: 8000,
    });

    const route = response.data?.routes?.[0];
    if (!route) {
      console.error("No route found (TomTom)");
      return null;
    }

    const summary = route.summary;

    return {
      distance: (summary.lengthInMeters / 1000).toFixed(2) + " km",
      duration: Math.round(summary.travelTimeInSeconds / 60) + " min",
      durationValue: summary.travelTimeInSeconds,
      coordinates: route.legs[0].points.map((p) => [
        p.latitude,
        p.longitude,
      ]),
    };
  } catch (error) {
    if (error.response) {
      console.error("TomTom API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error("TomTom API Error:", error.message);
    }
    return null;
  }
};

/**
 * ⏱ Calculate ETA in minutes
 */
export const calculateETA = (durationValue) => {
  if (!durationValue) return 0;
  return Math.round(durationValue / 60);
};

/**
 * 🚦 Route deviation check (distance based)
 */
export const checkRouteDeviation = (
  userLat,
  userLng,
  destLat,
  destLng,
  thresholdKm = 0.5 // 500 meters
) => {
  const distance = haversineDistance(
    userLat,
    userLng,
    destLat,
    destLng
  );
  return distance > thresholdKm;
};
