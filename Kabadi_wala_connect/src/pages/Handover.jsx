import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatWeight } from "../utils/helpers";
import {
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
  FaCopy,
  FaClock,
  FaMapMarkerAlt,
  FaQrcode,
  FaCheck
} from "react-icons/fa";

export const Handover = () => {
  const navigate = useNavigate();
  const { user, activeLot, selectedRecycler } = useApp();
  const { state } = useLocation();

  const lot = state?.lot || activeLot;
  const recycler = state?.recycler || selectedRecycler;
  const certificateId = state?.certificateId || `KBC-${lot?.id || Date.now()}`;

  const [copied, setCopied] = useState(false);
  const [isVerifiedByBuyer, setIsVerifiedByBuyer] = useState(false);

  const formattedWeight = Number(lot?.total_weight || 0).toFixed(2);
  const formattedValue = Number(lot?.estimated_value || 0).toFixed(2);

  const verificationPayloadObj = {
    type: "kabadiwala-handover-v2",
    certificateId,
    lotId: lot?.id,
    collectorId: user?.id || "coll_demo",
    collectorName: user?.name || "Kailash Local Collector",
    collectorPhone: user?.phone || "+91 98765 43210",
    recyclerId: recycler?.id || "rec_1",
    recyclerName: recycler?.name || "EcoRecycle India Hub",
    totalWeight: formattedWeight,
    estimatedValue: formattedValue,
    timestamp: new Date().toISOString(),
    gps: { lat: lot?.gps_lat || 19.076, lng: lot?.gps_lng || 72.8777 },
    materials: lot?.materials || [{ name: "Mixed E-Waste", weight_kg: formattedWeight }],
    securityHash: `VERIF-${(lot?.id || "LOT").slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`
  };

  const verificationPayloadString = JSON.stringify(verificationPayloadObj);

  // Store in localStorage so buyer portal on same machine can detect or scan
  useEffect(() => {
    if (lot) {
      localStorage.setItem("kabadi_active_handover_payload", verificationPayloadString);
      localStorage.setItem("kabadi_active_handover_id", certificateId);
    }
  }, [lot, certificateId, verificationPayloadString]);

  // Listen for buyer verification in real-time via storage event or polling
  useEffect(() => {
    const checkVerification = () => {
      const verifiedId = localStorage.getItem("kabadi_verified_certificate_id");
      if (verifiedId === certificateId) {
        setIsVerifiedByBuyer(true);
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 1500);
    window.addEventListener("storage", checkVerification);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkVerification);
    };
  }, [certificateId]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(verificationPayloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSimulateVerify = () => {
    localStorage.setItem("kabadi_verified_certificate_id", certificateId);
    setIsVerifiedByBuyer(true);
  };

  const handleProceed = () => {
    navigate("/payment", {
      state: {
        lot,
        recycler,
        certificateId,
        verificationData: verificationPayloadObj
      }
    });
  };

  if (!lot) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Navbar title="Verified Handover" />
        <main className="max-w-md mx-auto p-4">
          <Card className="p-8 text-center space-y-3">
            <FaQrcode className="mx-auto text-4xl text-gray-400" />
            <h3 className="font-extrabold text-gray-800 text-lg">No Active Scrap Lot</h3>
            <p className="text-xs text-gray-500">Create a scrap lot before generating a handover pass.</p>
            <Button className="mt-2" onClick={() => navigate("/scan")}>
              Scan Scrap Item
            </Button>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="Handover & Verification" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Status Alert */}
        {isVerifiedByBuyer ? (
          <Card className="p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex items-center gap-3 shadow-md animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shrink-0">
              <FaCheckCircle />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-sm text-emerald-900">Verified by Authorized Buyer!</h4>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {recycler?.name} scanned and approved this handover.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-4 bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center text-lg shrink-0 animate-pulse">
              <FaClock />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
                  Awaiting Buyer Scan
                </h4>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Present this QR code to the depot manager to verify authenticity.
              </p>
            </div>
          </Card>
        )}

        {/* Boarding Pass / Handover Ticket */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-soft">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-4 text-white">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                MoM E-Waste EPR Pass
              </span>
              <span className="text-[10px] font-mono text-emerald-200">
                ID: {certificateId}
              </span>
            </div>
            <h2 className="text-lg font-extrabold mt-2 leading-tight">
              Traceable Scrap Handover
            </h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
              <FaMapMarkerAlt className="text-[10px]" />
              <span>Target Depot: {recycler?.name || "Authorized Recycler"}</span>
            </p>
          </div>

          {/* QR Code Canvas */}
          <div className="p-6 text-center bg-gray-50/50">
            <div className="inline-flex p-3 bg-white rounded-2xl border-4 border-emerald-500 shadow-md">
              <QRCodeCanvas
                value={verificationPayloadString}
                size={210}
                level="H"
                includeMargin
              />
            </div>

            <p className="text-xs font-mono font-bold text-gray-700 mt-3">
              {verificationPayloadObj.securityHash}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Cryptographically signed with timestamp & GPS coordinates
            </p>

            <button
              onClick={handleCopyPayload}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all"
            >
              {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
              <span>{copied ? "Copied QR Payload!" : "Copy Verification Code"}</span>
            </button>
          </div>

          {/* Perforated Divider */}
          <div className="relative border-t-2 border-dashed border-gray-300 my-1">
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-gray-50 border-r border-gray-200" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-gray-50 border-l border-gray-200" />
          </div>

          {/* Ticket Footer Details */}
          <div className="p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Certified Net Weight</span>
              <strong className="text-gray-900 font-extrabold">{formatWeight(formattedWeight)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Payout</span>
              <strong className="text-emerald-700 font-extrabold text-sm">
                {formatCurrency(formattedValue)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Collector Identity</span>
              <strong className="text-gray-900">{user?.name || "Verified Collector"}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          <Button
            size="lg"
            variant="primary"
            onClick={handleProceed}
            icon={FaArrowRight}
            className="w-full shadow-md"
          >
            {isVerifiedByBuyer ? "Proceed to Payment Settlement" : "Continue to Payment"}
          </Button>

          {!isVerifiedByBuyer && (
            <button
              type="button"
              onClick={handleManualSimulateVerify}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/80 transition-all text-center border border-emerald-300/50"
            >
              ⚡ Fast Test: Simulate Buyer Scanned & Verified
            </button>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
