import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { PriceCard } from "../components/PriceCard";
import { Card } from "../components/Card";
import { mockMaterials } from "../data/mockData";
import { SCRAP_CATEGORIES } from "../utils/constants";
import { useApp } from "../context/AppContext";

export const PriceBoard = () => {
  const navigate = useNavigate();
  const { setActiveItem, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredMaterials = mockMaterials.filter((m) =>
    selectedCategory === "all" ? true : m.category === selectedCategory
  );

  const handleSelectMaterial = (material) => {
    setActiveItem(material);
    navigate("/estimated-value");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("todayPrices") || "Scrap Price Board"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Market Rate Status Banner */}
        <div className="bg-emerald-gradient p-5 rounded-3xl text-white shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Live Mandi Rates
            </span>
            <h2 className="text-xl font-extrabold mt-1">Today's Scrap Market</h2>
            <p className="text-emerald-100 text-xs mt-0.5">Updated 10 mins ago • Mumbai Market</p>
          </div>
          <div className="text-4xl select-none">📈</div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SCRAP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Price Cards List */}
        <div className="space-y-3">
          {filteredMaterials.map((mat) => (
            <PriceCard
              key={mat.id}
              material={mat}
              onClick={() => handleSelectMaterial(mat)}
            />
          ))}
        </div>

        {/* Market Trend Comparison Visual Preview */}
        <Card className="p-5">
          <h4 className="font-extrabold text-gray-900 text-sm mb-3">
            Market Value Comparison (₹/kg)
          </h4>
          <div className="space-y-3">
            {mockMaterials.slice(0, 4).map((m) => (
              <div key={m.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>{m.icon} {m.name}</span>
                  <span className="text-emerald-700">₹{m.pricePerKg}/kg</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (m.pricePerKg / 700) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};
