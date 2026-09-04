import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatWeight } from "../utils/helpers";
import { createTransaction, confirmHandover } from "../services/transactionService";
import { updateLotStatus, updateTraceabilityStatus } from "../services/lotService";
import {
  FaLock,
  FaMoneyBillWave,
  FaMobileAlt,
  FaUniversity,
  FaVolumeUp,
  FaCheckCircle,
  FaReceipt,
  FaSpinner
} from "react-icons/fa";

export const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useApp();

  const lot = state?.lot;
  const recycler = state?.recycler;

  const [method, setMethod] = useState("upi"); // "upi" | "cash" | "bank"
  const [upiApp, setUpiApp] = useState("phonepe"); // "phonepe" | "gpay" | "paytm" | "bhim"
  const [soundboxEnabled, setSoundboxEnabled] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [error, setError] = useState("");

  const payableAmount = Number(lot?.estimated_value || 1500).toFixed(2);
  const lotWeight = Number(lot?.total_weight || 10).toFixed(2);

  // Cash denomination breakdown calculation
  const getDenominations = (total) => {
    let remaining = Math.floor(Number(total));
    const d500 = Math.floor(remaining / 500);
    remaining %= 500;
    const d200 = Math.floor(remaining / 200);
    remaining %= 200;
    const d100 = Math.floor(remaining / 100);
    remaining %= 100;
    const d50 = Math.floor(remaining / 50);
    remaining %= 50;
    const coins = remaining + (Number(total) - Math.floor(Number(total)));
    return { d500, d200, d100, d50, coins: Number(coins.toFixed(2)) };
  };

  const denominations = getDenominations(payableAmount);

  // Play synthetic tone & speech announcement
  const playSoundboxAnnouncement = (amount) => {
    if (!soundboxEnabled) return;
    try {
      // Audio Chime using Web Audio API
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);

      // Speech Synthesizer Voice Announcement
      if ("speechSynthesis" in window) {
        const text = `Received ${amount} rupees on ${upiApp.toUpperCase()}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Audio fallback silent
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handlePay = async () => {
    if (!lot || !recycler?.id || !user?.id) {
      return setError("Missing lot or recycler details. Please restart the sale.");
    }

    setProcessing(true);
    setError("");

    try {
      setProcessingStep("1/3: Connecting to Bank / NPCI Switch...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep("2/3: Authorizing Recycler Escrow Account...");
      await new Promise((r) => setTimeout(r, 650));

      setProcessingStep("3/3: Settling Instant Payment...");
      const handoverRef = state?.certificateId || `HO-${Date.now()}`;

      const transaction = await createTransaction({
        lotId: lot.id,
        recyclerId: recycler.id,
        quotedPrice: payableAmount,
        finalPrice: payableAmount,
        handoverRef
      });

      const paid = await confirmHandover(transaction.id, payableAmount);
      await updateLotStatus(lot.id, "paid");
      await updateTraceabilityStatus(lot.id, "paid");

      // Signal Soundbox & Confetti
      if (method === "upi") {
        playSoundboxAnnouncement(payableAmount);
      }
      triggerConfetti();

      // Brief delay to let the user enjoy the celebration
      setTimeout(() => {
        navigate("/certificate", {
          state: {
            lot,
            recycler,
            transaction: paid,
            certificateId: handoverRef,
            method,
            settledAmount: payableAmount,
            viewRole: "collector"
          }
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Mock payment failed");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="Instant Payment Settlement" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Security Banner */}
        <Card className="p-4 bg-emerald-50 border border-emerald-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0">
            <FaLock />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-gray-900">Escrow Payment Gateway</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Simulates immediate buyer settlement upon verified scrap handover.
            </p>
          </div>
        </Card>

        {/* Payout Summary Card */}
        <Card className="p-6 text-center shadow-soft border border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Certified Settlement Amount
          </p>
          <p className="text-4xl font-extrabold text-emerald-700 mt-2 tracking-tight">
            {formatCurrency(payableAmount)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            For {formatWeight(lotWeight)} scrap lot • {recycler?.name || "Authorized Buyer"}
          </p>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { id: "upi", name: "Instant UPI", icon: FaMobileAlt },
              { id: "cash", name: "Depot Cash", icon: FaMoneyBillWave },
              { id: "bank", name: "Bank IMPS", icon: FaUniversity }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`text-base ${isSelected ? "text-emerald-700" : "text-gray-500"}`} />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Method 1: Instant UPI Details */}
          {method === "upi" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-left space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Choose UPI App:</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Zero Fee
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "phonepe", label: "PhonePe", color: "bg-purple-600 text-white" },
                  { id: "gpay", label: "GPay", color: "bg-blue-600 text-white" },
                  { id: "paytm", label: "Paytm", color: "bg-sky-600 text-white" },
                  { id: "bhim", label: "BHIM", color: "bg-amber-600 text-white" }
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setUpiApp(app.id)}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all ${
                      upiApp === app.id
                        ? `${app.color} shadow-sm scale-105`
                        : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    {app.label}
                  </button>
                ))}
              </div>

              {/* Soundbox toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                  <FaVolumeUp className="text-emerald-600" />
                  <span>Audio Soundbox Announcement</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSoundboxEnabled(!soundboxEnabled)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                    soundboxEnabled ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {soundboxEnabled ? "ON 🔊" : "OFF"}
                </button>
              </div>
            </div>
          )}

          {/* Method 2: Depot Cash Details */}
          {method === "cash" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-gray-800">Cash Counter Denominations</span>
                <span className="font-mono text-emerald-700 font-bold">Total: {formatCurrency(payableAmount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-white rounded-xl border border-gray-200 flex justify-between">
                  <span className="text-gray-500">₹500 Notes:</span>
                  <strong>{denominations.d500} × ₹500</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-gray-200 flex justify-between">
                  <span className="text-gray-500">₹200 Notes:</span>
                  <strong>{denominations.d200} × ₹200</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-gray-200 flex justify-between">
                  <span className="text-gray-500">₹100 Notes:</span>
                  <strong>{denominations.d100} × ₹100</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-gray-200 flex justify-between">
                  <span className="text-gray-500">Coins / Bal:</span>
                  <strong>₹{denominations.coins}</strong>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                Collector signs the digital physical register upon note handover.
              </p>
            </div>
          )}

          {/* Method 3: Direct Bank IMPS */}
          {method === "bank" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary Name:</span>
                <strong className="text-gray-900">{user?.name || "Kailash Local Collector"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bank Account:</span>
                <span className="font-mono font-bold text-gray-800">•••• •••• 4892 (State Bank of India)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IFSC Code:</span>
                <span className="font-mono text-gray-700">SBIN0001234</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-500">IMPS UTR Ref:</span>
                <span className="font-mono text-emerald-800 font-bold">2026-IMPS-884920</span>
              </div>
            </div>
          )}

          {error && <p className="text-xs font-bold text-red-600 mt-4">{error}</p>}
        </Card>

        {/* Processing Indicator */}
        {processing && (
          <Card className="p-4 bg-emerald-50 border border-emerald-300 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs">
              <FaSpinner className="animate-spin text-base" />
              <span>{processingStep}</span>
            </div>
            <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-3/4 animate-pulse" />
            </div>
          </Card>
        )}

        <Button
          size="lg"
          variant="primary"
          onClick={handlePay}
          loading={processing}
          icon={FaCheckCircle}
          className="w-full shadow-lg"
        >
          {processing ? "Settling Transaction..." : `Confirm & Receive ${formatCurrency(payableAmount)}`}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};
