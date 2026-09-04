import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { calculateTotalValue, formatCurrency } from "../utils/helpers";
import { FaMinus, FaPlus, FaTrash, FaShoppingBag } from "react-icons/fa";

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
      weightKg: Math.max(0.1, Number((Number(item.weightKg || 0) + amount).toFixed(1)))
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="My Scrap Bag" />
      <main className="max-w-md mx-auto p-4 space-y-4">
        {bagItems.length === 0 ? (
          <Card className="p-8 text-center">
            <FaShoppingBag className="mx-auto text-4xl text-emerald-500 mb-3" />
            <h2 className="font-extrabold text-gray-900 text-lg">Your bag is empty</h2>
            <p className="text-sm text-gray-500 mt-1">Scan items and keep them here until you are ready to sell.</p>
            <Button className="mt-5" onClick={() => navigate("/scan")}>Scan an Item</Button>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Saved for sale</p>
                <h2 className="text-xl font-extrabold text-gray-900">{bagItems.length} item{bagItems.length === 1 ? "" : "s"}</h2>
              </div>
              <button onClick={clearBag} className="text-xs font-bold text-red-600">Clear bag</button>
            </div>

            {bagItems.map((item) => (
              <Card key={item.bagId} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{item.icon || "📦"}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-emerald-700 font-bold">{formatCurrency(item.pricePerKg)}/kg</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => adjustWeight(item, -0.5)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><FaMinus className="text-xs" /></button>
                      <span className="font-extrabold text-gray-900 min-w-16 text-center">{item.weightKg} kg</span>
                      <button onClick={() => adjustWeight(item, 0.5)} className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><FaPlus className="text-xs" /></button>
                      <button onClick={() => removeFromBag(item.bagId)} className="ml-auto text-red-500 p-2" aria-label={`Remove ${item.name}`}><FaTrash className="text-sm" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-5 bg-emerald-gradient text-white">
              <div className="flex justify-between text-sm font-bold"><span>Total weight</span><span>{totalWeight.toFixed(1)} kg</span></div>
              <div className="flex justify-between text-xl font-extrabold mt-2"><span>Estimated value</span><span>{formatCurrency(totalValue)}</span></div>
            </Card>

            <Button size="lg" onClick={() => navigate("/estimated-value", { state: { bagItems } })}>
              Sell This Bag Together
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/scan")}>
              Add More Items
            </Button>
          </>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};
