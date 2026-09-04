import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { formatCurrency } from "../utils/helpers";
import { FaDownload, FaCheckCircle } from "react-icons/fa";

export const Certificate = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const certificateId = state?.certificateId || `KBC-${Date.now()}`;
  const lot = state?.lot;
  const recycler = state?.recycler;
  const payload = JSON.stringify({ type: "kabadiwala-certificate", certificateId, lotId: lot?.id, transactionId: state?.transaction?.id });

  const downloadCertificate = () => {
    const body = `Kabadiwala Connect Certificate\nReference: ${certificateId}\nLot: ${lot?.id}\nWeight: ${lot?.total_weight} kg\nValue: ${formatCurrency(lot?.estimated_value)}\nRecycler: ${recycler?.name || "Recycler"}`;
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${certificateId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="Sale Certificate" />
      <main className="max-w-md mx-auto p-4 space-y-4">
        <Card className="p-6 text-center border-2 border-emerald-300">
          <FaCheckCircle className="mx-auto text-4xl text-emerald-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-3">Verified mock transaction</p>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Sale Certificate</h1>
          <p className="text-xs text-gray-500 mt-2">{certificateId}</p>
          <div className="flex justify-center my-5"><QRCodeCanvas value={payload} size={160} includeMargin /></div>
          <div className="text-left border-t border-gray-100 pt-4 space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">Weight</span><strong>{lot?.total_weight} kg</strong></div><div className="flex justify-between"><span className="text-gray-500">Payout</span><strong className="text-emerald-700">{formatCurrency(lot?.estimated_value || 0)}</strong></div><div className="flex justify-between"><span className="text-gray-500">Buyer</span><strong>{recycler?.name || "Recycler"}</strong></div></div>
        </Card>
        <p className="text-xs text-center text-gray-500">This demo certificate records the handover reference for future government traceability integration.</p>
        <Button variant="secondary" size="lg" onClick={downloadCertificate} icon={FaDownload}>Download Certificate</Button>
        <Button size="lg" onClick={() => navigate("/earnings")}>View My Earnings</Button>
      </main>
      <BottomNavigation />
    </div>
  );
};
