import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LanguageSelector } from "../components/LanguageSelector";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { FaGlobe, FaArrowRight } from "react-icons/fa";

export const LanguageSelection = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useApp();

  const handleConfirm = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 max-w-md mx-auto">
      <div className="pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-emerald-600/30">
            <FaGlobe />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {t("selectLanguage") || "Choose App Language"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            आप अपनी सुविधा अनुसार भाषा चुनें
          </p>
        </motion.div>

        <LanguageSelector
          selectedLanguage={language}
          onSelect={(langId) => changeLanguage(langId)}
        />
      </div>

      <div className="py-6">
        <Button
          onClick={handleConfirm}
          variant="primary"
          size="lg"
          icon={FaArrowRight}
        >
          Continue to App
        </Button>
      </div>
    </div>
  );
};
