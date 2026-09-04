import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { mockMaterials } from "../data/mockData";
import { formatCurrency, calculateTotalValue } from "../utils/helpers";
import { FaPlus, FaMinus, FaCalculator, FaMapMarkerAlt } from "react-icons/fa";

export const EstimatedValue = () => {
  const navigate = useNavigate();
  const { activeItem, setActiveItem, t } = useApp();

  const currentMaterial = activeItem || mockMaterials[0];
  const [weightKg, setWeightKg] = useState(5.0);

  const totalEstimate = calculateTotalValue(currentMaterial.pricePerKg, weightKg);

  const handleIncrement = (amount) => {
    setWeightKg((prev) => Math.max(0.5, Number((prev + amount).toFixed(1))));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("estimatedValue") || "Value Calculator"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Selected Scrap Item Header */}
        <Card className="p-4 bg-emerald-50/60 border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm border border-emerald-100">
              {currentMaterial.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Selected Scrap
              </span>
              <h3 className="font-extrabold text-gray-900 text-xl leading-tight">
                {currentMaterial.name}
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Rate: <span className="font-bold text-emerald-800">{formatCurrency(currentMaterial.pricePerKg)}</span> / kg
              </p>
            </div>
          </div>
        </Card>

        {/* Big Touch Weight Counter Input */}
        <Card className="p-6 text-center space-y-4">
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            {t("weightInKg") || "Enter Scrap Weight (KG)"}
          </label>

          <div className="flex items-center justify-center space-x-4 my-2">
            <button
              onClick={() => handleIncrement(-1)}
              className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-2xl flex items-center justify-center active:scale-95 transition-all shadow-sm"
              aria-label="Decrease weight"
            >
              <FaMinus />
            </button>

            <div className="flex items-baseline space-x-1 px-4 py-2 bg-emerald-50 rounded-3xl border-2 border-emerald-500 min-w-[140px] justify-center">
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(0, Number(e.target.value)))}
                className="w-24 text-center text-4xl font-extrabold text-emerald-900 bg-transparent focus:outline-none"
              />
              <span className="text-lg font-bold text-emerald-700">kg</span>
            </div>

            <button
              onClick={() => handleIncrement(1)}
              className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center active:scale-95 transition-all shadow-md shadow-emerald-600/30"
              aria-label="Increase weight"
            >
              <FaPlus />
            </button>
          </div>

          {/* Quick Increment Pills */}
          <div className="flex justify-center gap-2 pt-1">
            {[1, 5, 10, 25, 50].map((val) => (
              <button
                key={val}
                onClick={() => setWeightKg(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  weightKg === val
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                +{val}kg
              </button>
            ))}
          </div>
        </Card>

        {/* Total Estimated Value Card */}
        <Card className="p-6 bg-emerald-gradient text-white text-center shadow-soft relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
            Total Estimated Payout
          </span>
          <div className="text-5xl font-extrabold my-2 tracking-tight">
            {formatCurrency(totalEstimate)}
          </div>
          <p className="text-xs text-emerald-100 font-medium">
            Based on average rate of {weightKg} kg × {formatCurrency(currentMaterial.pricePerKg)}
          </p>
        </Card>

        {/* Call to Action */}
        <Button
          onClick={() => navigate("/recyclers")}
          variant="primary"
          size="lg"
          icon={FaMapMarkerAlt}
        >
          {t("findBuyers") || "Find Nearby Recyclers to Sell"}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};
