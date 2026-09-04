// Utility helper functions for formatting, validation, and calculations

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
};

export const formatDistance = (km) => {
  if (km === null || km === undefined) return "Nearby";
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${Number(km).toFixed(1)} km`;
};

export const formatWeight = (kg) => {
  const weight = Number(kg) || 0;
  return `${weight} kg`;
};

export const validatePhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone);
};

export const calculateTotalValue = (pricePerKg, weightKg) => {
  const price = Number(pricePerKg) || 0;
  const weight = Number(weightKg) || 0;
  return Math.round(price * weight);
};

export const simulateDelay = (ms = 600) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const PIN_SALT = "kabadiwala-connect-sih26229";

export const hashPin = async (pin) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${pin}:${PIN_SALT}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const verifyPinHash = async (pin, storedHash) => {
  if (!pin || !storedHash) return false;
  const computed = await hashPin(pin);
  return computed === storedHash;
};

export const generatePin = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

export const formatDateLabel = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const mapDbCategoryToFrontend = (dbCategory) => {
  const map = {
    PCB: "e_waste",
    LCD: "e_waste",
    CRT: "e_waste",
    cables: "metal",
    metal: "metal",
    batteries: "hazardous",
    motors: "hazardous",
    mixed_plastic: "plastic",
    paper: "paper"
  };
  return map[dbCategory] || "metal";
};

export const mapFrontendMaterialToDbCategory = (material) => {
  const name = `${material?.name || ""} ${material?.category || ""}`.toLowerCase();

  if (material?.dbCategory) return material.dbCategory;
  if (name.includes("pcb") || name.includes("circuit")) return "PCB";
  if (name.includes("copper") || name.includes("wire") || name.includes("cable")) return "cables";
  if (name.includes("battery")) return "batteries";
  if (name.includes("motor") || name.includes("transformer")) return "motors";
  if (name.includes("plastic")) return "mixed_plastic";
  if (name.includes("lcd") || name.includes("led") || name.includes("screen")) return "LCD";
  if (name.includes("cardboard") || name.includes("paper")) return "paper";
  return "metal";
};

export const MATERIAL_ICONS = {
  PCB: "💻",
  cables: "🔌",
  batteries: "🔋",
  CRT: "📺",
  motors: "⚙️",
  mixed_plastic: "🍾",
  LCD: "📺",
  paper: "📦",
  metal: "⚡"
};
