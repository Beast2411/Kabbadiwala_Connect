import React from "react";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { mockSafetyTips } from "../data/mockData";
import { useApp } from "../context/AppContext";
import { FaShieldAlt } from "react-icons/fa";

export const SafetyGuide = () => {
  const { language, t } = useApp();

  const getLocalizedTitle = (tip) => {
    if (language === "hi" && tip.hindiTitle) return tip.hindiTitle;
    if (language === "mr" && tip.marathiTitle) return tip.marathiTitle;
    return tip.title;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("safetyGuide") || "Safety Guidelines"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Safety Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 rounded-3xl text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Essential Rules
            </span>
            <h2 className="text-xl font-extrabold mt-1">Health & Protection Rules</h2>
            <p className="text-red-100 text-xs mt-0.5">Simple visual safety guide for collectors</p>
          </div>
          <div className="text-4xl text-white/90">
            <FaShieldAlt />
          </div>
        </div>

        {/* Visual Illustrated Cards for Low-Literacy Users */}
        <div className="space-y-4">
          {mockSafetyTips.map((tip) => (
            <Card key={tip.id} className={`p-5 border-2 ${tip.bgColor}`}>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-sm shrink-0 border border-gray-100">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg leading-snug">
                    {getLocalizedTitle(tip)}
                  </h3>
                  <p className="text-xs font-medium text-gray-700 mt-1 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
