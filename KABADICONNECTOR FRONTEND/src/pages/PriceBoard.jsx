import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { PriceCard } from "../components/PriceCard";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { getPriceBoard } from "../services/priceService";
import { SCRAP_CATEGORIES } from "../utils/constants";
import { useApp } from "../context/AppContext";
import { formatCurrency, calculateTotalValue } from "../utils/helpers";
import { FaShoppingBag, FaMinus, FaPlus, FaTimes, FaCheck } from "react-icons/fa";

export const PriceBoard = () => {
  const navigate = useNavigate();
  const { setActiveItem, addToBag, bagItems, t } = useApp();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Quick Add to Bag Modal State
  const [modalMaterial, setModalMaterial] = useState(null);
  const [modalWeight, setModalWeight] = useState(5.0);
  const [addedToast, setAddedToast] = useState("");

  useEffect(() => {
    getPriceBoard()
      .then(setMaterials)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredMaterials = materials.filter((m) =>
    selectedCategory === "all" ? true : m.category === selectedCategory
  );

  const handleSelectMaterial = (material) => {
    setActiveItem(material);
    navigate("/estimated-value");
  };

  const handleOpenQuickAdd = (material) => {
    setModalMaterial(material);
    setModalWeight(5.0);
  };

  const handleConfirmAddToBag = () => {
    if (!modalMaterial) return;
    addToBag(modalMaterial, null, modalWeight);
    setAddedToast(`Added ${modalWeight.toFixed(2)} kg of ${modalMaterial.name} to Bag!`);
    setModalMaterial(null);
    setTimeout(() => setAddedToast(""), 3000);
  };

  const totalBagValue = bagItems.reduce(
    (sum, item) => sum + calculateTotalValue(item.pricePerKg, item.weightKg),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("todayPrices") || "Scrap Price Board"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {addedToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <FaCheck className="text-emerald-300" />
            <span>{addedToast}</span>
          </div>
        )}

        <div className="bg-emerald-gradient p-5 rounded-3xl text-white shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Live Mandi Rates
            </span>
            <h2 className="text-xl font-extrabold mt-1">Today's Scrap Market</h2>
            <p className="text-emerald-100 text-xs mt-0.5">Synced from Supabase • 2-Decimal Precision</p>
          </div>
          <div className="text-4xl select-none">📈</div>
        </div>

        {/* Bag Shortcut Header if items exist */}
        {bagItems.length > 0 && (
          <div
            onClick={() => navigate("/bag")}
            className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-100/70 transition-all shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs">
                <FaShoppingBag />
              </div>
              <div>
                <span className="text-xs font-extrabold text-gray-900">
                  {bagItems.length} {bagItems.length === 1 ? "Item" : "Items"} in Bag
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Est. Payout: <strong className="text-emerald-800">{formatCurrency(totalBagValue)}</strong>
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-emerald-100">
              View Bag →
            </span>
          </div>
        )}

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

        {loading ? (
          <Loader message="Loading live prices..." />
        ) : (
          <div className="space-y-3">
            {filteredMaterials.map((mat) => (
              <PriceCard
                key={mat.id}
                material={mat}
                onClick={() => handleSelectMaterial(mat)}
                onQuickAdd={handleOpenQuickAdd}
              />
            ))}
          </div>
        )}

        {!loading && filteredMaterials.length > 0 && (
          <Card className="p-5">
            <h4 className="font-extrabold text-gray-900 text-sm mb-3">Market Value Comparison (₹/kg)</h4>
            <div className="space-y-3">
              {materials.slice(0, 4).map((m) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>{m.icon} {m.name}</span>
                    <span className="text-emerald-700 font-extrabold">{formatCurrency(m.pricePerKg)}/kg</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (m.pricePerKg / 700) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Quick Add with Quantity Chooser Modal */}
      {modalMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{modalMaterial.icon}</span>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{modalMaterial.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Rate: <strong className="text-emerald-700">{formatCurrency(modalMaterial.pricePerKg)}/kg</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMaterial(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>Choose Quantity (KG)</span>
                <span className="text-emerald-700">
                  Subtotal: <strong>{formatCurrency(calculateTotalValue(modalMaterial.pricePerKg, modalWeight))}</strong>
                </span>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setModalWeight((prev) => Math.max(0.5, Number((prev - 0.5).toFixed(2))))}
                  className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gray-200 text-gray-700 font-extrabold flex items-center justify-center"
                >
                  <FaMinus className="text-xs" />
                </button>
                <div className="flex items-baseline px-4 py-1.5 bg-white rounded-xl border border-emerald-300">
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={modalWeight}
                    onChange={(e) => setModalWeight(Math.max(0.1, Number(Number(e.target.value).toFixed(2))))}
                    className="w-20 text-center font-extrabold text-xl text-emerald-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-emerald-700 ml-1">kg</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalWeight((prev) => Number((prev + 0.5).toFixed(2)))}
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>

              <div className="flex justify-center gap-1.5 pt-1">
                {[1, 2, 5, 10, 20].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setModalWeight(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      modalWeight === val ? "bg-emerald-700 text-white" : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    {val} kg
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="md" onClick={() => setModalMaterial(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleConfirmAddToBag} icon={FaShoppingBag} className="flex-1">
                Add to Bag
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
