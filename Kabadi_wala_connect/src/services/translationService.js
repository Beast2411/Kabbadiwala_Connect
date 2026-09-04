// Service for UI Language translations (Supports English, Hindi, Marathi)
import { translations } from "../data/mockData";
import { DEFAULT_LANGUAGE } from "../utils/constants";

export const getTranslations = (language = DEFAULT_LANGUAGE) => {
  return translations[language] || translations.en;
};

export const t = (key, language = DEFAULT_LANGUAGE) => {
  const currentLang = translations[language] || translations.en;
  return currentLang[key] || translations.en[key] || key;
};
