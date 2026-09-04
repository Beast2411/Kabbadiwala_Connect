// Mock Service for Location and Map Coordinates
import { simulateDelay } from "../utils/helpers";
import { DEFAULT_LOCATION } from "../utils/constants";

export const getCurrentLocation = async () => {
  await simulateDelay(400);
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Live Location"
          });
        },
        () => {
          // Fallback to default location on error or permission denied
          resolve(DEFAULT_LOCATION);
        },
        { timeout: 5000 }
      );
    } else {
      resolve(DEFAULT_LOCATION);
    }
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};
