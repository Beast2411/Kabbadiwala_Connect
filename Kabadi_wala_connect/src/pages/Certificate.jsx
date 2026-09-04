import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatWeight } from "../utils/helpers";
import { addRecyclerReview } from "../services/reviewService";
import {
  FaDownload,
  FaCheckCircle,
  FaPrint,
  FaStar,
  FaShieldAlt,
  FaAward,
  FaUserCheck,
  FaIndustry,
  FaCheck
} from "react-icons/fa";

export const Certificate = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { state } = useLocation();

  const certificateId = state?.certificateId || `KBC-${Date.now()}`;
  const lot = state?.lot;
  const recycler = state?.recycler;
  const initialRole = state?.viewRole || "collector"; // "collector" | "buyer"

  const [activeRole, setActiveRole] = useState(initialRole);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(["Fair Weight ⚖️", "Instant Cash ⚡"]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const formattedWeight = Number(lot?.total_weight || 10).toFixed(2);
  const formattedPayout = Number(lot?.estimated_value || 1500).toFixed(2);

  const payload = JSON.stringify({
    type: "kabadiwala-bilateral-certificate",
    certificateId,
    lotId: lot?.id,
    collectorId: user?.id,
    recyclerId: recycler?.id,
    certifiedWeightKg: formattedWeight,
    settlementAmount: formattedPayout,
    standard: "SIH26229-MoM-EPR-2026"
  });

  const availableTags = [
    "Fair Weight ⚖️",
    "Instant Cash ⚡",
    "Official EPR 🌿",
    "Respectful Staff 👍",
    "Best Price 💰"
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!recycler?.id) return;
    await addRecyclerReview({
      recyclerId: recycler.id,
      buyerName: recycler.name || "Authorized Recycler",
      collectorName: user?.name || "Kabadiwala Partner",
      rating,
      comment: reviewComment,
      tags: selectedTags
    });
    setReviewSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadCertificate = () => {
    const body = `=====================================================
KABADIWALA CONNECT — DIGITAL HANDOVER CERTIFICATE
Government of India • Ministry of Mines (SIH26229)
Compliance: E-Waste (Management) Rules, 2022
=====================================================
Certificate ID: ${certificateId}
Role Copy:      ${activeRole === "collector" ? "COLLECTOR COPY (Green Passbook)" : "AUTHORIZED RECYCLER COPY (EPR Credit)"}
Date & Time:    ${new Date().toLocaleString("en-IN")}
Status:         VERIFIED & SETTLED (100% Traceable)

[PARTICIPANTS]
Collector:      ${user?.name || "Verified Collector Partner"} (${user?.phone || "+91 98765 43210"})
Authorized Recycler: ${recycler?.name || "EcoRecycle India Hub"}
Depot Reg ID:   ${recycler?.registrationId || "CPCB/EPR/2026/MH-883"}

[MATERIAL SETTLEMENT]
Certified Weight: ${formatWeight(formattedWeight)}
Total Settlement: ${formatCurrency(formattedPayout)} (Verified 2-Decimal Settlement)
Transaction Hash: VERIF-EPR-${certificateId}
=====================================================
    `;
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${certificateId}_${activeRole}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 print:bg-white print:p-0">
      <div className="print:hidden">
        <Navbar title="Digital Handover Certificate" />
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4 print:max-w-none print:p-6">
        {/* Bilateral Copy Selector Toggle */}
        <div className="flex bg-gray-200 p-1 rounded-2xl print:hidden">
          <button
            onClick={() => setActiveRole("collector")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === "collector"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaAward className="text-emerald-600" />
            <span>Collector Copy</span>
          </button>
          <button
            onClick={() => setActiveRole("buyer")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === "buyer"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaIndustry className="text-blue-600" />
            <span>Buyer (Depot) Copy</span>
          </button>
        </div>

        {/* Certificate Card */}
        <div className="relative bg-white rounded-3xl border-4 border-emerald-600 p-6 shadow-xl overflow-hidden print:border-2 print:shadow-none">
          {/* Subtle Watermark Badge */}
          <div className="absolute -right-8 -bottom-8 text-gray-100/80 pointer-events-none select-none text-9xl">
            <FaShieldAlt />
          </div>

          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-emerald-100 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-300">
              <FaShieldAlt />
              <span>Ministry of Mines • SIH26229</span>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mt-1">
              Certificate of Safe E-Waste Handover
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              E-Waste (Management) Rules 2022 Formal Recycling Protocol
            </p>
            <div className="inline-block mt-1">
              <span className="text-[10px] font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                Ref: {certificateId}
              </span>
            </div>
          </div>

          {/* Role Copy Badge */}
          <div className="my-4 text-center">
            <span
              className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                activeRole === "collector"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-blue-600 text-white shadow-xs"
              }`}
            >
              {activeRole === "collector" ? "Collector Green Passbook Record" : "Authorized Recycler EPR Credit Slip"}
            </span>
          </div>

          {/* Two-Party Breakdown */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block flex items-center gap-1">
                <FaUserCheck className="text-emerald-600" /> Seller (Collector)
              </span>
              <p className="font-extrabold text-gray-900 mt-0.5">{user?.name || "Local Scrap Collector"}</p>
              <p className="text-[11px] text-gray-500">{user?.phone || "+91 98765 43210"}</p>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded mt-1 inline-block">
                KYC Verified
              </span>
            </div>

            <div className="border-l border-gray-200 pl-3">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block flex items-center gap-1">
                <FaIndustry className="text-blue-600" /> Buyer (Depot)
              </span>
              <p className="font-extrabold text-gray-900 mt-0.5">{recycler?.name || "EcoRecycle India Hub"}</p>
              <p className="text-[11px] text-gray-500">Reg: CPCB/EPR/2026</p>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded mt-1 inline-block">
                Authorized Recycler
              </span>
            </div>
          </div>

          {/* Financial & Weight Settlement */}
          <div className="my-4 space-y-2 border-t border-b border-gray-100 py-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Handover Date & Time:</span>
              <strong className="text-gray-900">{new Date().toLocaleDateString("en-IN")} • Today</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Certified Scrap Net Weight:</span>
              <strong className="text-gray-900 font-extrabold text-sm">{formatWeight(formattedWeight)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Settled Transaction Amount:</span>
              <span className="text-lg font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {formatCurrency(formattedPayout)}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">GPS Geo-Coordinates:</span>
              <span className="font-mono text-gray-600">19.0760° N, 72.8777° E (Mumbai)</span>
            </div>
          </div>

          {/* QR Authenticity Watermark */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <FaCheckCircle />
                <span>Digitally Sealed & Traceable</span>
              </div>
              <p className="text-[10px] text-gray-400 max-w-[190px]">
                Valid for EPR regulatory reporting and scrap seller proof of income.
              </p>
            </div>
            <div className="p-1.5 bg-white border-2 border-emerald-400 rounded-xl shadow-xs">
              <QRCodeCanvas value={payload} size={70} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 print:hidden">
          <Button variant="secondary" size="md" onClick={downloadCertificate} icon={FaDownload}>
            Download .TXT
          </Button>
          <Button variant="primary" size="md" onClick={handlePrint} icon={FaPrint}>
            Print / Save PDF
          </Button>
        </div>

        {/* Buyer Rating Form for Collector */}
        {activeRole === "collector" && (
          <Card className="p-5 border border-amber-200 bg-amber-50/40 space-y-3 print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm">
                  Rate Your Buyer: {recycler?.name || "Depot"}
                </h4>
                <p className="text-[11px] text-gray-500">Help other kabadiwalas know fair buyers</p>
              </div>
              <FaStar className="text-amber-500 text-xl" />
            </div>

            {reviewSubmitted ? (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600" />
                <span>Thank you! Your rating has been recorded.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                {/* 5-Star Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-all ${
                          star <= rating ? "text-amber-400 scale-110" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 ml-1">
                    {rating}.0 / 5.0
                  </span>
                </div>

                {/* Quick Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Comment Input */}
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Optional comment: (e.g. Fair weight, quick payment)"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-emerald-600"
                />

                <Button type="submit" size="sm" variant="primary" className="w-full">
                  Submit Buyer Review
                </Button>
              </form>
            )}
          </Card>
        )}

        <div className="print:hidden space-y-2">
          <Button size="lg" variant="ghost" onClick={() => navigate("/earnings")} className="w-full">
            View My Earnings Passbook →
          </Button>
          <Button size="md" variant="secondary" onClick={() => navigate("/dashboard")} className="w-full">
            Back to Home
          </Button>
        </div>
      </main>

      <div className="print:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};
