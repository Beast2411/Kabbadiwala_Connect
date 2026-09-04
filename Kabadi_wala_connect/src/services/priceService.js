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
  const baseMaterials = [...mockMaterials];
  if (!isSupabaseConfigured) return baseMaterials;

  try {
    const { data: prices, error } = await supabase
      .from("prices")
      .select("*")
      .eq("location", location)
      .order("price_date", { ascending: false });

    if (error || !prices || prices.length === 0) return baseMaterials;

    const latestPriceMap = {};
    for (const row of prices) {
      if (!latestPriceMap[row.material_category]) {
        latestPriceMap[row.material_category] = row;
      }
    }

    return baseMaterials.map((mat) => {
      const match =
        latestPriceMap[mat.id] ||
        latestPriceMap[mat.name] ||
        latestPriceMap[mat.dbCategory] ||
        (mat.id?.includes("pcb") ? latestPriceMap["PCB"] : null) ||
        (mat.id?.includes("battery") ? latestPriceMap["batteries"] : null) ||
        (mat.id?.includes("television") ? latestPriceMap["LCD"] : null) ||
        (mat.id?.includes("copper") ? latestPriceMap["cables"] : null) ||
        (mat.id?.includes("plastic") ? latestPriceMap["mixed_plastic"] : null);

      if (match) {
        return {
          ...mat,
          pricePerKg: Math.round(Number(match.quoted_price || match.buying_price || mat.pricePerKg)),
          unit: match.unit || mat.unit
        };
      }
      return mat;
    });
  } catch {
    return baseMaterials;
  }
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
