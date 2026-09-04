import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaGlobe } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import { LANGUAGES } from "../utils/constants";

export const Navbar = ({ title = null, showBack = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage } = useApp();

  const isHome = location.pathname === "/dashboard" || location.pathname === "/";
  const currentLangObj = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  const cycleLanguage = () => {
    const currentIndex = LANGUAGES.findIndex((l) => l.id === language);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    changeLanguage(LANGUAGES[nextIndex].id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack && !isHome && (
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <FaChevronLeft className="text-lg" />
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/30">
              ♻️
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 leading-tight text-lg tracking-tight">
                {title || "Kabadiwala Connect"}
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
                Informal Trader Network
              </p>
            </div>
          </div>
        </div>

        {/* Quick Language Toggle Pill */}
        <button
          onClick={cycleLanguage}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-xs hover:bg-emerald-100 transition-all active:scale-95"
          title="Change language"
        >
          <FaGlobe className="text-emerald-600 text-xs" />
          <span className="font-semibold">{currentLangObj.nativeName}</span>
        </button>
      </div>
    </header>
  );
};
