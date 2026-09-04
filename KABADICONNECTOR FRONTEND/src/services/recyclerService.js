// Mock Service for fetching nearby recyclers and scrap buyers
import { simulateDelay } from "../utils/helpers";
import { mockRecyclers } from "../data/mockData";

export const getNearbyRecyclers = async (location = null, categoryFilter = "all") => {
  await simulateDelay(500);
  let list = [...mockRecyclers];

  if (categoryFilter && categoryFilter !== "all") {
    list = list.filter(r => r.acceptedCategories.includes(categoryFilter));
  }

  // Sort by distance
  list.sort((a, b) => a.distanceKm - b.distanceKm);

  return list;
};

export const getRecyclerDetails = async (id) => {
  await simulateDelay(300);
  const recycler = mockRecyclers.find(r => r.id === id);
  if (!recycler) {
    throw new Error("Recycler not found");
  }
  return recycler;
};
