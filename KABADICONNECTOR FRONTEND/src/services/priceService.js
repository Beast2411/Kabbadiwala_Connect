import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  mapDbCategoryToFrontend,
  MATERIAL_ICONS,
  formatDateLabel
} from "../utils/helpers";
import { mockMaterials } from "../data/mockData";

const MATERIAL_LABELS = {
  PCB: "E-Waste PCB Board",
  cables: "Copper Wire / Cables",
  batteries: "Lead Acid Battery",
  CRT: "CRT Display",
  motors: "Electric Motor",
  mixed_plastic: "Rigid Plastic (HDPE)",
  LCD: "LCD / LED Screen",
  paper: "Corrugated Cardboard"
};

const buildMaterialFromPrice = (category, latestPrice, prevPrice) => {
  const pricePerKg = Math.round(Number(latestPrice?.quoted_price || latestPrice?.buying_price || 0));
  const prev = Number(prevPrice?.quoted_price || prevPrice?.buying_price || pricePerKg);
  const diff = pricePerKg - prev;
  let trend = "stable";
  let change = "Stable";
  if (diff > 2) {
    trend = "up";
    change = `+₹${diff} today`;
  } else if (diff < -2) {
    trend = "down";
    change = `-₹${Math.abs(diff)} today`;
  }

  return {
    id: category,
    dbCategory: category,
    name: MATERIAL_LABELS[category] || category,
    category: mapDbCategoryToFrontend(category),
    pricePerKg,
    unit: latestPrice?.unit || "kg",
    trend,
    change,
    icon: MATERIAL_ICONS[category] || "📦",
    confidence: 90,
    shortDescription: `Market rate for ${MATERIAL_LABELS[category] || category} in Mumbai`,
    safetyWarning: "Follow safety guidance before handling this material."
  };
};

export const getPriceBoard = async (location = "Mumbai") => {
  if (!isSupabaseConfigured) return mockMaterials;

  const { data: prices, error } = await supabase
    .from("prices")
    .select("*")
    .eq("location", location)
    .order("price_date", { ascending: false });

  if (error) throw new Error(error.message);

  const byCategory = {};
  for (const row of prices || []) {
    if (!byCategory[row.material_category]) {
      byCategory[row.material_category] = [];
    }
    byCategory[row.material_category].push(row);
  }

  return Object.entries(byCategory).map(([category, rows]) =>
    buildMaterialFromPrice(category, rows[0], rows[1])
  );
};

export const getMaterialByCategory = async (category) => {
  const board = await getPriceBoard();
  return board.find((m) => m.dbCategory === category || m.id === category) || board[0];
};

export const getPriceHistory = async (materialCategory, days = 30) => {
  const { data, error } = await supabase
    .from("prices")
    .select("price_date, quoted_price, buying_price")
    .eq("material_category", materialCategory)
    .order("price_date", { ascending: true })
    .limit(days);

  if (error) throw new Error(error.message);
  return data || [];
};

export const getAllMaterials = async () => getPriceBoard();

export { formatDateLabel };
