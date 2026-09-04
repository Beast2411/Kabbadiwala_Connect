import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/helpers";
import { createTransaction, confirmHandover } from "../services/transactionService";
import { updateLotStatus, updateTraceabilityStatus } from "../services/lotService";
import { FaLock, FaMoneyBillWave } from "react-icons/fa";

export const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useApp();
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const lot = state?.lot;
  const recycler = state?.recycler;

  const handlePay = async () => {
    if (!lot || !recycler?.id || !user?.id) return setError("Missing lot or recycler details. Please restart the sale.");
    setProcessing(true);
    setError("");
    try {
      const handoverRef = state.certificateId || `HO-${Date.now()}`;
      const transaction = await createTransaction({
        lotId: lot.id,
        recyclerId: recycler.id,
        quotedPrice: lot.estimated_value,
        finalPrice: lot.estimated_value,
        handoverRef
      });
      const paid = await confirmHandover(transaction.id, lot.estimated_value);
      await updateLotStatus(lot.id, "paid");
      await updateTraceabilityStatus(lot.id, "paid");
      navigate("/certificate", { state: { lot, recycler, transaction: paid, certificateId: handoverRef, method } });
    } catch (err) {
      setError(err.message || "Mock payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="Mock Payment" />
      <main className="max-w-md mx-auto p-4 space-y-4">
        <Card className="p-5 bg-amber-50 border-amber-200">
          <div className="flex gap-3"><FaLock className="text-amber-600 mt-1" /><div><h2 className="font-extrabold text-gray-900">Demo payment gateway</h2><p className="text-xs text-gray-600 mt-1">No real money will move. This simulates an instant payment after verified handover.</p></div></div>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Amount to receive</p>
          <p className="text-4xl font-extrabold text-emerald-700 mt-2">{formatCurrency(lot?.estimated_value || 0)}</p>
          <div className="grid grid-cols-2 gap-2 mt-5">
            {["upi", "cash"].map((value) => <button key={value} onClick={() => setMethod(value)} className={`p-3 rounded-xl border-2 font-bold text-sm ${method === value ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600"}`}><FaMoneyBillWave className="mx-auto mb-1" />{value === "upi" ? "Mock UPI" : "Mock Cash"}</button>)}
          </div>
          {error && <p className="text-xs font-bold text-red-600 mt-4">{error}</p>}
        </Card>
        <Button size="lg" onClick={handlePay} loading={processing}>Simulate Successful Payment</Button>
      </main>
      <BottomNavigation />
    </div>
  );
};
