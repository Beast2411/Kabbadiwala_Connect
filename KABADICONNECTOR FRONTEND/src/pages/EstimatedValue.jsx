import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { mockMaterials } from "../data/mockData";
import {
  formatCurrency,
  calculateTotalValue,
  mapFrontendMaterialToDbCategory
} from "../utils/helpers";
import { createLot } from "../services/lotService";
import { FaPlus, FaMinus, FaMapMarkerAlt } from "react-icons/fa";

export const EstimatedValue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeItem, user, userLocation, setActiveLot, clearBag, t } = useApp();

  const scanState = location.state || {};
  const scannedMaterial = scanState.scanResult?.detectedMaterial;
  const imagePreview = scanState.imagePreview || null;
  const bagItems = scanState.bagItems || null;
  const currentMaterial = activeItem || scannedMaterial || mockMaterials[0];
  const [weightKg, setWeightKg] = useState(5.0);
  const [saving, setSaving] = useState(false);

  const materialsToSell = bagItems?.length ? bagItems : [{ ...currentMaterial, weightKg }];
  const totalWeight = bagItems?.length
    ? bagItems.reduce((sum, item) => sum + Number(item.weightKg || 0), 0)
    : weightKg;
  const totalEstimate = bagItems?.length
    ? bagItems.reduce((sum, item) => sum + calculateTotalValue(item.pricePerKg, item.weightKg), 0)
    : calculateTotalValue(currentMaterial.pricePerKg, weightKg);

  const handleIncrement = (amount) => {
    setWeightKg((prev) => Math.max(0.5, Number((prev + amount).toFixed(1))));
  };

  const handleFindBuyers = async () => {
    if (!user?.id) {
      navigate("/recyclers");
      return;
    }

    setSaving(true);
    try {
      const lot = await createLot({
        collectorId: user.id,
        materials: materialsToSell.map((material) => ({
          category: mapFrontendMaterialToDbCategory(material),
          name: material.name,
          weight_kg: Number(material.weightKg || 0),
          price_per_kg: material.pricePerKg
        })),
        totalWeight,
        estimatedValue: totalEstimate,
        photoUrls: materialsToSell.map((material) => material.imagePreview).filter(Boolean),
        gpsLat: userLocation?.lat,
        gpsLng: userLocation?.lng,
        status: "created",
        materialData: bagItems?.length ? null : {
          category: mapFrontendMaterialToDbCategory(currentMaterial),
          subCategory: currentMaterial.subCategory || null,
          description: currentMaterial.shortDescription || currentMaterial.description || currentMaterial.name,
          imageUrl: imagePreview || currentMaterial.imageUrl || null,
          weightKg: totalWeight,
          condition: currentMaterial.condition || "mixed"
        },
        traceability: {
          photoUrls: materialsToSell.map((material) => material.imagePreview).filter(Boolean),
          weight: totalWeight,
          gpsLat: userLocation?.lat,
          gpsLng: userLocation?.lng,
          handoverReferenceNumber: `LOT-${Date.now()}`,
          status: "created"
        }
      });
      setActiveLot(lot);
      if (bagItems?.length) clearBag();
      navigate("/recyclers");
    } catch (err) {
      console.error(err);
      navigate("/recyclers");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("estimatedValue") || "Value Calculator"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        <Card className="p-4 bg-emerald-50/60 border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm border border-emerald-100">
              {currentMaterial.icon}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {bagItems?.length ? `${bagItems.length} Items in Bag` : "Selected Scrap"}
              </span>
              {bagItems?.length ? (
                <div className="mt-2 space-y-1">
                  {bagItems.map((item) => (
                    <p key={item.bagId} className="text-sm font-bold text-gray-900">
                      {item.icon} {item.name} <span className="text-xs text-gray-500">({item.weightKg} kg)</span>
                    </p>
                  ))}
                </div>
              ) : (
                <>
                  <h3 className="font-extrabold text-gray-900 text-xl leading-tight">{currentMaterial.name}</h3>
                  <p className="text-xs text-gray-600 font-medium">
                    Rate: <span className="font-bold text-emerald-800">{formatCurrency(currentMaterial.pricePerKg)}</span> / kg
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 text-center space-y-4">
          <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            {bagItems?.length ? "Combined Bag Weight" : (t("weightInKg") || "Enter Scrap Weight (KG)")}
          </label>
          {bagItems?.length ? (
            <p className="text-4xl font-extrabold text-emerald-900">{totalWeight.toFixed(1)} <span className="text-lg text-emerald-700">kg</span></p>
          ) : (
          <>
          <div className="flex items-center justify-center space-x-4 my-2">
            <button onClick={() => handleIncrement(-1)} className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-2xl flex items-center justify-center">
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
            <button onClick={() => handleIncrement(1)} className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center">
              <FaPlus />
            </button>
          </div>
          <div className="flex justify-center gap-2 pt-1">
            {[1, 5, 10, 25, 50].map((val) => (
              <button
                key={val}
                onClick={() => setWeightKg(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  weightKg === val ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                +{val}kg
              </button>
            ))}
          </div>
          </>
          )}
        </Card>

        <Card className="p-6 bg-emerald-gradient text-white text-center shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Estimated Payout</span>
          <div className="text-5xl font-extrabold my-2 tracking-tight">{formatCurrency(totalEstimate)}</div>
          {!bagItems?.length && (
          <p className="text-xs text-emerald-100 font-medium">
            {weightKg} kg × {formatCurrency(currentMaterial.pricePerKg)} — saved as lot on continue
          </p>
          )}
          {bagItems?.length > 0 && (
            <p className="text-xs text-emerald-100 font-medium">
              {totalWeight.toFixed(1)} kg across {bagItems.length} items - saved as lot on continue
            </p>
          )}
        </Card>

        <Button onClick={handleFindBuyers} variant="primary" size="lg" icon={FaMapMarkerAlt} loading={saving}>
          {t("findBuyers") || "Find Nearby Recyclers to Sell"}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};
