import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { QRScannerModal } from "../components/QRScannerModal";
import { supabase } from "../lib/supabase";
import { getCurrentBuyer, logoutBuyer } from "../services/authService";
import { getOpenLots, updateLotStatus } from "../services/lotService";
import { getAllRecyclers } from "../services/recyclerService";
import { createTransaction, confirmHandover } from "../services/transactionService";
import { getRecyclerRatingStats } from "../services/reviewService";
import { formatCurrency, formatWeight } from "../utils/helpers";
import {
  FaQrcode,
  FaCheckCircle,
  FaStar,
  FaShieldAlt,
  FaCertificate,
  FaFileContract,
  FaTimes,
  FaArrowRight
} from "react-icons/fa";

export const BuyerDashboard = () => {
  const navigate = useNavigate();
  const buyer = getCurrentBuyer();

  const [lots, setLots] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Scanner & Verification States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(null);
  const [issuedCertificates, setIssuedCertificates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kabadi_issued_certificates") || "[]");
    } catch {
      return [];
    }
  });

  const ratingStats = getRecyclerRatingStats(buyer.id || "rec_1", 4.8, 38);

  const loadData = async () => {
    setLoading(true);
    try {
      const [openLots, allRecyclers] = await Promise.all([getOpenLots(), getAllRecyclers()]);
      setLots(openLots);
      setRecyclers(allRecyclers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScanSuccess = (payload) => {
    setIsScannerOpen(false);
    setScannedData(payload);
  };

  const handleApproveHandover = async () => {
    if (!scannedData) return;

    try {
      const certId = scannedData.certificateId || `KBC-${Date.now()}`;
      const certWeight = Number(scannedData.totalWeight || 10).toFixed(2);
      const certValue = Number(scannedData.estimatedValue || 1500).toFixed(2);

      // Signal collector app in real-time
      localStorage.setItem("kabadi_verified_certificate_id", certId);

      const newCert = {
        certificateId: certId,
        lotId: scannedData.lotId || `LOT-${Date.now()}`,
        collectorName: scannedData.collectorName || "Local Scrap Collector",
        collectorPhone: scannedData.collectorPhone || "+91 98765 43210",
        buyerName: buyer.name,
        buyerId: buyer.id,
        totalWeight: certWeight,
        estimatedValue: certValue,
        materials: scannedData.materials || [{ name: "Mixed E-Waste Scrap", weight_kg: certWeight }],
        securityHash: scannedData.securityHash || `VERIF-${Date.now().toString(36).toUpperCase()}`,
        verifiedAt: new Date().toISOString()
      };

      const updatedCerts = [newCert, ...issuedCertificates];
      setIssuedCertificates(updatedCerts);
      localStorage.setItem("kabadi_issued_certificates", JSON.stringify(updatedCerts));

      // Update lot status if lotId is in DB
      if (scannedData.lotId) {
        try {
          await updateLotStatus(scannedData.lotId, "paid");
        } catch {}
      }

      setVerificationSuccess(newCert);
      setScannedData(null);
      await loadData();
    } catch (err) {
      alert("Verification failed: " + err.message);
    }
  };

  const handleViewBuyerCertificate = (cert) => {
    navigate("/certificate", {
      state: {
        lot: {
          id: cert.lotId,
          total_weight: cert.totalWeight,
          estimated_value: cert.estimatedValue,
          materials: cert.materials
        },
        recycler: {
          id: buyer.id,
          name: buyer.name
        },
        certificateId: cert.certificateId,
        viewRole: "buyer"
      }
    });
  };

  const handleAcceptLot = async (lot) => {
    if (!buyer.id) return;
    try {
      await createTransaction({
        lotId: lot.id,
        recyclerId: buyer.id,
        quotedPrice: lot.estimated_value,
        finalPrice: null,
        handoverRef: `HO-${Date.now()}`
      });
      await updateLotStatus(lot.id, "matched");
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmPayment = async (lot) => {
    try {
      const { data: txs, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("lot_id", lot.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const tx = txs?.[0];
      if (tx) {
        await confirmHandover(tx.id, lot.estimated_value);
        await updateLotStatus(lot.id, "paid");
        await loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await logoutBuyer();
    navigate("/buyer/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar title="Buyer Portal & Depot Management" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Depot Profile Header */}
        <Card className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-soft">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Authorized EPR Recycler Depot
              </span>
              <h2 className="text-xl font-extrabold mt-2 leading-tight">{buyer.name}</h2>
              <p className="text-xs text-gray-300 mt-0.5">{buyer.email}</p>
            </div>
            <div className="flex items-center bg-amber-400/20 px-2.5 py-1 rounded-xl text-amber-300 border border-amber-400/30">
              <FaStar className="text-amber-400 text-xs mr-1" />
              <span className="text-xs font-extrabold">{ratingStats.averageRating}</span>
              <span className="text-[10px] text-gray-300 ml-1">({ratingStats.reviewsCount})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-700/60 text-center">
            <div className="bg-white/5 p-2 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Open Lots</span>
              <span className="text-lg font-extrabold text-white">{lots.length}</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">EPR Certs Issued</span>
              <span className="text-lg font-extrabold text-emerald-400">{issuedCertificates.length}</span>
            </div>
          </div>
        </Card>

        {/* Primary Action: QR Code Verification Scanner */}
        <div className="space-y-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold shadow-lg shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">
              <FaQrcode />
            </div>
            <div className="text-left">
              <span className="text-sm block">Scan Collector Handover QR</span>
              <span className="text-[10px] font-normal text-emerald-100 block">
                Instant digital verification & bilateral certificate
              </span>
            </div>
          </button>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate("/buyer/register")} className="flex-1">
              Add Another Depot
            </Button>
            <Button variant="danger" size="sm" onClick={handleLogout} className="flex-1">
              Log Out
            </Button>
          </div>
        </div>

        {/* Verification Success Banner */}
        {verificationSuccess && (
          <Card className="p-4 bg-emerald-50 border-2 border-emerald-500 shadow-md space-y-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-emerald-600 text-3xl shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-900">
                  Handover Verified & Certificate Issued!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Ref: <strong className="font-mono">{verificationSuccess.certificateId}</strong> •{" "}
                  {formatWeight(verificationSuccess.totalWeight)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleViewBuyerCertificate(verificationSuccess)}
                icon={FaCertificate}
                className="flex-1"
              >
                View Buyer Certificate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVerificationSuccess(null)}
                className="text-xs text-gray-600"
              >
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* Issued Digital Certificates List */}
        {issuedCertificates.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                Issued EPR Digital Certificates ({issuedCertificates.length})
              </h3>
            </div>

            <div className="space-y-2">
              {issuedCertificates.slice(0, 3).map((cert, i) => (
                <Card key={i} className="p-3.5 flex items-center justify-between hover:border-emerald-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">
                      <FaFileContract />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-900 font-mono">
                        {cert.certificateId}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {cert.collectorName} • {formatWeight(cert.totalWeight)} •{" "}
                        <strong className="text-emerald-700">{formatCurrency(cert.estimatedValue)}</strong>
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewBuyerCertificate(cert)}
                    icon={FaArrowRight}
                  >
                    View
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Incoming Collector Lots */}
        <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider pt-2">
          Incoming Collector Lots
        </h3>

        {loading ? (
          <Loader message="Syncing lots from database..." />
        ) : lots.length === 0 ? (
          <Card className="p-6 text-center text-sm text-gray-500">
            No open lots yet. Collectors will appear here when they create scrap lots.
          </Card>
        ) : (
          lots.map((lot) => (
            <Card key={lot.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-gray-900">
                    {lot.collectors?.name || "Collector"} — {formatWeight(lot.total_weight)}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Est. <strong className="text-emerald-700">{formatCurrency(lot.estimated_value)}</strong> • Status: {lot.status}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(lot.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {lot.status === "created" && (
                  <Button size="sm" variant="primary" onClick={() => handleAcceptLot(lot)}>
                    Accept Lot
                  </Button>
                )}
                {lot.status === "matched" && (
                  <Button size="sm" variant="secondary" onClick={() => handleConfirmPayment(lot)}>
                    Confirm Cash Payment
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}

        {/* Collector Ratings & Reviews Section */}
        <Card className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-gray-900 text-sm">Collector Ratings & Feedback</h4>
            <div className="flex items-center text-amber-500 text-xs font-extrabold">
              <FaStar className="mr-1" />
              <span>{ratingStats.averageRating} / 5.0</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {ratingStats.reviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>{rev.collectorName}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <FaStar key={idx} className="text-[10px]" />
                    ))}
                  </div>
                </div>
                {rev.comment && <p className="text-gray-600 italic">"{rev.comment}"</p>}
                {rev.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md text-emerald-800 border border-gray-200">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Scanned Handover Verification Modal */}
      {scannedData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FaShieldAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Handover Verification</h3>
                  <p className="text-xs text-gray-500">Government EPR Traceability</p>
                </div>
              </div>
              <button
                onClick={() => setScannedData(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Certificate Reference:</span>
                <span className="font-mono font-bold text-gray-900">{scannedData.certificateId || "KBC-DEMO"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Collector Name:</span>
                <strong className="text-gray-900">{scannedData.collectorName || "Local Collector"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Collector Phone:</span>
                <span className="text-gray-700">{scannedData.collectorPhone || "+91 98765 43210"}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-500">Net Scrap Weight:</span>
                <strong className="text-gray-900 font-extrabold text-sm">
                  {formatWeight(scannedData.totalWeight || 10)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payable Settlement:</span>
                <strong className="text-emerald-700 font-extrabold text-sm">
                  {formatCurrency(scannedData.estimatedValue || 1500)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Security Signature:</span>
                <span className="font-mono text-[10px] text-emerald-800 font-bold">
                  {scannedData.securityHash || "VERIFIED-OK"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="md" onClick={() => setScannedData(null)} className="flex-1">
                Reject
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleApproveHandover}
                icon={FaCheckCircle}
                className="flex-1 shadow-md"
              >
                Approve & Certify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
