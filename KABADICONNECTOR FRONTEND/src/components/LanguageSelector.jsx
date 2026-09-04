import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { LANGUAGES } from "../utils/constants";

export const LanguageSelector = ({ selectedLanguage, onSelect, compact = false }) => {
  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => onSelect(lang.id)}
              className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {lang.icon} {lang.nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      {LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage === lang.id;
        return (
          <motion.div
            key={lang.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(lang.id)}
            className={`cursor-pointer p-5 rounded-3xl border-2 flex items-center justify-between transition-all duration-200 ${
              isSelected
                ? "bg-emerald-50/80 border-emerald-600 shadow-md shadow-emerald-600/10"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-4xl select-none">{lang.icon}</span>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl">
                  {lang.nativeName}
                </h3>
                <p className="text-xs text-gray-500 font-medium">{lang.description}</p>
              </div>
            </div>

            {isSelected ? (
              <FaCheckCircle className="text-emerald-600 text-2xl shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0"></div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
