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
