import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/helpers";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";

export const Handover = () => {
  const navigate = useNavigate();
  const { user, activeLot, selectedRecycler } = useApp();
  const { state } = useLocation();
  const lot = state?.lot || activeLot;
  const recycler = state?.recycler || selectedRecycler;
  const certificateId = `KBC-${lot?.id || Date.now()}`;
  const verificationPayload = JSON.stringify({
    type: "kabadiwala-handover",
    certificateId,
    lotId: lot?.id,
    collectorId: user?.id,
    recyclerId: recycler?.id
  });

  if (!lot) {
    return <div className="min-h-screen bg-gray-50"><Navbar title="Verified Handover" /><main className="max-w-md mx-auto p-4"><Card className="p-6 text-center">Create a scrap lot before starting a handover.</Card></main></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="Verified Handover" />
      <main className="max-w-md mx-auto p-4 space-y-4">
        <Card className="p-5 bg-gray-900 text-white">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-emerald-400 text-2xl" />
            <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Government traceability demo</p><h2 className="text-lg font-extrabold">Scan to verify this sale</h2></div>
          </div>
          <p className="text-xs text-gray-300 mt-3">Show this QR to the recycler before payment. It links the collector, lot, seller, and certificate reference.</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="inline-flex rounded-2xl border-8 border-white shadow-lg"><QRCodeCanvas value={verificationPayload} size={210} includeMargin /></div>
          <p className="text-xs font-extrabold text-gray-900 mt-4">Certificate reference: {certificateId}</p>
          <p className="text-xs text-gray-500 mt-1">{recycler?.name || "Selected recycler"}</p>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Lot weight</span><strong>{lot.total_weight} kg</strong></div>
          <div className="flex justify-between text-sm mt-2"><span className="text-gray-500">Estimated payout</span><strong className="text-emerald-700">{formatCurrency(lot.estimated_value)}</strong></div>
        </Card>

        <Button size="lg" onClick={() => navigate("/payment", { state: { lot, recycler, certificateId } })} icon={FaArrowRight}>
          Continue to Mock Payment
        </Button>
      </main>
      <BottomNavigation />
    </div>
  );
};
