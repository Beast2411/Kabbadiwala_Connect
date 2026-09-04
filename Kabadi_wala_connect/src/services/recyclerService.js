import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { haversineKm, mapDbCategoryToFrontend, MATERIAL_ICONS } from "../utils/helpers";
import { mockRecyclers } from "../data/mockData";
import { calculateDistance } from "./locationService";

const CATEGORY_ALIASES = {
  metal: ["metal", "cables"],
  e_waste: ["e_waste", "PCB", "LCD", "CRT"],
  plastic: ["plastic", "mixed_plastic"],
  paper: ["paper"],
  hazardous: ["hazardous", "batteries", "motors"]
};

const formatRateBonus = (offeredRates) => {
  if (!offeredRates || typeof offeredRates !== "object") return "Competitive rates";
  const top = Object.entries(offeredRates).sort((a, b) => b[1] - a[1])[0];
  if (!top) return "Competitive rates";
  return `Best: ${top[0]} ₹${top[1]}/kg`;
};

const mapRecyclerRow = (row, userLat, userLng) => {
  const lat = row.location_lat ?? 19.076;
  const lng = row.location_lng ?? 72.8777;
  const distanceKm =
    userLat != null && userLng != null
      ? haversineKm(userLat, userLng, lat, lng)
      : calculateDistance(19.076, 72.8777, lat, lng);

  const accepted = (row.materials_accepted || []).map(mapDbCategoryToFrontend);
  const uniqueCategories = [...new Set(accepted.length ? accepted : row.materials_accepted || [])];

  return {
    id: row.id,
    name: row.name,
    ownerName: row.name.split(" ")[0] || "Owner",
    rating: 4.5 + Math.random() * 0.4,
    reviewsCount: Math.floor(Math.random() * 150) + 20,
    distanceKm,
    lat,
    lng,
    address: `Mumbai area • ${row.registration_id || "Local depot"}`,
    phone: row.contact || "",
    openHours: "08:00 AM - 08:00 PM",
    pickupAvailable: row.pickup_available ?? false,
    minPickupWeightKg: row.pickup_available ? 30 : 0,
    rateBonus: formatRateBonus(row.offered_rates),
    acceptedCategories: uniqueCategories.length ? uniqueCategories : row.materials_accepted || [],
    rawMaterialsAccepted: row.materials_accepted || [],
    offeredRates: row.offered_rates || {},
    verified: row.authorized ?? false,
    registrationId: row.registration_id,
    contact: row.contact
  };
};

const scoreRecycler = (recycler, materialCategory) => {
  const distanceScore = Math.max(0, 10 - recycler.distanceKm);
  const rateKey = Object.keys(recycler.offeredRates || {}).find((k) =>
    (CATEGORY_ALIASES[materialCategory] || [materialCategory]).some(
      (alias) => k.toLowerCase().includes(alias.replace("_", "")) || alias.includes(k)
    )
  );
  const rate = rateKey ? Number(recycler.offeredRates[rateKey]) : 50;
  const rateScore = rate / 20;
  const pickupScore = recycler.pickupAvailable ? 3 : 0;
  const authScore = recycler.verified ? 2 : 0;
  return distanceScore * 0.4 + rateScore * 0.35 + pickupScore * 0.15 + authScore * 0.1;
};

export const getNearbyRecyclers = async (
  location = null,
  categoryFilter = "all",
  materialCategory = null
) => {
  const userLat = location?.lat ?? 19.076;
  const userLng = location?.lng ?? 72.8777;

  if (!isSupabaseConfigured) {
    let list = [...mockRecyclers];
    if (categoryFilter && categoryFilter !== "all") {
      list = list.filter((r) => r.acceptedCategories.includes(categoryFilter));
    }
    list.sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }

  const { data, error } = await supabase
    .from("recyclers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let list = (data || []).map((row) => mapRecyclerRow(row, userLat, userLng));

  if (categoryFilter && categoryFilter !== "all") {
    list = list.filter((r) => r.acceptedCategories.includes(categoryFilter));
  }

  if (materialCategory) {
    list.sort(
      (a, b) =>
        scoreRecycler(b, materialCategory) - scoreRecycler(a, materialCategory)
    );
  } else {
    list.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return list.slice(0, 10);
};

export const getRecyclerDetails = async (id, location = null) => {
  if (!isSupabaseConfigured) {
    const recycler = mockRecyclers.find((r) => r.id === id);
    if (!recycler) throw new Error("Recycler not found");
    return recycler;
  }

  const { data, error } = await supabase.from("recyclers").select("*").eq("id", id).single();
  if (error || !data) throw new Error("Recycler not found");

  return mapRecyclerRow(data, location?.lat, location?.lng);
};

export const createRecycler = async (payload) => {
  const { data, error } = await supabase
    .from("recyclers")
    .insert({
      name: payload.name,
      contact: payload.contact,
      registration_id: payload.registrationId || null,
      location_lat: payload.locationLat,
      location_lng: payload.locationLng,
      materials_accepted: payload.materialsAccepted || [],
      offered_rates: payload.offeredRates || {},
      pickup_available: payload.pickupAvailable ?? false,
      authorized: payload.authorized ?? false
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRecyclerRow(data, payload.locationLat, payload.locationLng);
};

export const updateRecycler = async (id, payload) => {
  const { data, error } = await supabase
    .from("recyclers")
    .update({
      name: payload.name,
      contact: payload.contact,
      registration_id: payload.registrationId,
      location_lat: payload.locationLat,
      location_lng: payload.locationLng,
      materials_accepted: payload.materialsAccepted,
      offered_rates: payload.offeredRates,
      pickup_available: payload.pickupAvailable,
      authorized: payload.authorized
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getAllRecyclers = async () => {
  const { data, error } = await supabase.from("recyclers").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data || []).map((row) => mapRecyclerRow(row, 19.076, 72.8777));
};

export { MATERIAL_ICONS, mapDbCategoryToFrontend };
