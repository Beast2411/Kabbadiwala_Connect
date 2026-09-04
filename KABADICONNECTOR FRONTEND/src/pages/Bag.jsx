import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { calculateTotalValue, formatCurrency, formatWeight } from "../utils/helpers";
import { FaMinus, FaPlus, FaTrash, FaShoppingBag, FaArrowRight, FaCamera } from "react-icons/fa";

export const Bag = () => {
  const navigate = useNavigate();
  const { bagItems, updateBagItem, removeFromBag, clearBag } = useApp();

  const totalWeight = bagItems.reduce((sum, item) => sum + Number(item.weightKg || 0), 0);
  const totalValue = bagItems.reduce(
    (sum, item) => sum + calculateTotalValue(item.pricePerKg, item.weightKg),
    0
  );

  const adjustWeight = (item, amount) => {
    updateBagItem(item.bagId, {
      weightKg: Math.max(0.1, Number((Number(item.weightKg || 0) + amount).toFixed(2)))
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="My Scrap Bag" />
      <main className="max-w-md mx-auto p-4 space-y-4">
        {bagItems.length === 0 ? (
          <Card className="p-8 text-center shadow-soft border-dashed border-2 border-gray-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              <FaShoppingBag />
            </div>
            <h2 className="font-extrabold text-gray-900 text-lg">Your Scrap Bag is Empty</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
              Add collected scrap items via AI Scan or the Live Price Board. Group them together for maximum payout!
            </p>
            <div className="flex gap-2 justify-center mt-5">
              <Button size="md" onClick={() => navigate("/scan")} icon={FaCamera}>
                Scan Scrap
              </Button>
              <Button size="md" variant="secondary" onClick={() => navigate("/prices")}>
                View Price Board
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                  Collected Items
                </p>
                <h2 className="text-xl font-extrabold text-gray-900 mt-1">
                  {bagItems.length} {bagItems.length === 1 ? "Lot Item" : "Lot Items"}
                </h2>
              </div>
              <button
                onClick={clearBag}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-xl transition-all"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {bagItems.map((item) => {
                const subtotal = calculateTotalValue(item.pricePerKg, item.weightKg);
                return (
                  <Card key={item.bagId} className="p-4 shadow-sm border border-gray-200/80 hover:border-emerald-300 transition-all">
                    <div className="flex items-start gap-3">
                      {item.imagePreview ? (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black shrink-0 border border-gray-200">
                          <img src={item.imagePreview} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl shrink-0 border border-emerald-100">
                          {item.icon || "📦"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{item.name}</h3>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              Rate: <span className="font-bold text-emerald-700">{formatCurrency(item.pricePerKg)}</span> / kg
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-emerald-800">
                              {formatCurrency(subtotal)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => adjustWeight(item, -0.5)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all active:scale-95"
                              title="Decrease 0.5kg"
                            >
                              <FaMinus className="text-[10px]" />
                            </button>
                            <span className="font-extrabold text-gray-900 min-w-16 text-center text-xs">
                              {Number(item.weightKg).toFixed(2)} kg
                            </span>
                            <button
                              onClick={() => adjustWeight(item, 0.5)}
                              className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition-all active:scale-95"
                              title="Increase 0.5kg"
                            >
                              <FaPlus className="text-[10px]" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromBag(item.bagId)}
                            className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="p-5 bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-soft">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-200">
                <span>COMBINED WEIGHT</span>
                <span className="text-sm text-white font-extrabold">{formatWeight(totalWeight)}</span>
              </div>
              <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-emerald-700/60">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Payout</span>
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </Card>

            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate("/estimated-value", { state: { bagItems } })}
              icon={FaArrowRight}
              className="w-full shadow-md"
            >
              Sell Entire Bag ({formatCurrency(totalValue)})
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/scan")}
              icon={FaCamera}
              className="w-full"
            >
              Scan & Add More Items
            </Button>
          </>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};
