import React from "react";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "../utils/helpers";
import { useApp } from "../context/AppContext";

export const PriceCard = ({ material, onClick }) => {
  const { language } = useApp();

  const getLocalizedName = () => {
    if (language === "hi" && material.hindiName) return material.hindiName;
    if (language === "mr" && material.marathiName) return material.marathiName;
    return material.name;
  };

  return (
    <Card onClick={onClick} hoverable className="mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shadow-sm">
            {material.icon}
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-base">
              {getLocalizedName()}
            </h4>
            <p className="text-xs text-gray-500 font-medium">Per {material.unit || "kg"}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-emerald-700">
            {formatCurrency(material.pricePerKg)}
          </div>
          <StatusBadge type={material.trend} text={material.change} className="mt-1" />
        </div>
      </div>
    </Card>
  );
};
