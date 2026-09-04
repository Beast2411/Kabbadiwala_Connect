// Application constants for Kabadiwala Connect

export const APP_NAME = "Kabadiwala Connect";

export const LANGUAGES = [
  { id: "en", name: "English", nativeName: "English", icon: "🇬🇧", description: "Default language" },
  { id: "hi", name: "Hindi", nativeName: "हिन्दी", icon: "🇮🇳", description: "हिंदी भाषा चुनें" },
  { id: "mr", name: "Marathi", nativeName: "मराठी", icon: "🚩", description: "मराठी भाषा निवडा" }
];

export const DEFAULT_LANGUAGE = "en";

export const SCRAP_CATEGORIES = [
  { id: "all", name: "All Items", icon: "📦" },
  { id: "metal", name: "Metals", icon: "⚡" },
  { id: "e_waste", name: "E-Waste", icon: "💻" },
  { id: "plastic", name: "Plastics", icon: "🍾" },
  { id: "paper", name: "Paper", icon: "📰" },
  { id: "hazardous", name: "Batteries & Motors", icon: "🔋" }
];

export const DEFAULT_LOCATION = {
  lat: 19.0760,
  lng: 72.8777,
  address: "Dharavi, Mumbai, Maharashtra"
};

export const OTP_EXPIRY_SECONDS = 60;
export const DEFAULT_COUNTRY_CODE = "+91";
export const HELPLINE_NUMBER = "1800-123-5222";
