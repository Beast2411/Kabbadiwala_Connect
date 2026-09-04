import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FaCamera, FaFileUpload, FaTimes, FaBolt, FaPaste, FaCheck } from "react-icons/fa";

export const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "upload" | "manual"
  const [errorMsg, setErrorMsg] = useState("");
  const [manualText, setManualText] = useState("");
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (!isOpen || activeTab !== "camera") {
      stopCamera();
      return;
    }

    const startCamera = async () => {
      setErrorMsg("");
      try {
        const html5QrCode = new Html5Qrcode("buyer-qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            handleSuccessfulScan(decodedText);
          },
          () => {
            // Frame scan failure ignored
          }
        );
        isScanningRef.current = true;
      } catch (err) {
        console.warn("Camera start failed, falling back to upload/demo mode", err);
        setHasCamera(false);
        setErrorMsg("Camera access unavailable or permission denied. You can upload a QR image or use 1-Click Fast Test.");
      }
    };

    const timer = setTimeout(startCamera, 300);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (scannerRef.current && isScanningRef.current) {
      scannerRef.current
        .stop()
        .catch(() => {})
        .finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
          isScanningRef.current = false;
        });
    }
  };

  const handleSuccessfulScan = (rawText) => {
    stopCamera();
    try {
      const parsed = JSON.parse(rawText);
      onScanSuccess(parsed);
    } catch {
      onScanSuccess({ raw: rawText, type: "kabadiwala-handover" });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    try {
      const html5QrCode = new Html5Qrcode("buyer-file-reader");
      const decoded = await html5QrCode.scanFile(file, true);
      handleSuccessfulScan(decoded);
    } catch (err) {
      setErrorMsg("Could not detect a valid QR code in this image. Please try another photo.");
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    handleSuccessfulScan(manualText);
  };

  const handleFastDemoScan = () => {
    const activePayload = localStorage.getItem("kabadi_active_handover_payload");
    if (activePayload) {
      handleSuccessfulScan(activePayload);
    } else {
      // Generate standard mock handover payload
      const mockPayload = JSON.stringify({
        type: "kabadiwala-handover-v2",
        certificateId: `KBC-DEMO-${Date.now()}`,
        lotId: `lot_${Date.now()}`,
        collectorName: "Sanjay Pawar (Local Collector)",
        collectorPhone: "+91 98201 23456",
        totalWeight: "12.50",
        estimatedValue: "1875.00",
        materials: [
          { name: "Printed Circuit Boards (PCBs)", weight_kg: 7.5 },
          { name: "Copper Wire Scrap", weight_kg: 5.0 }
        ],
        timestamp: new Date().toISOString(),
        securityHash: `VERIF-SEC-${Date.now().toString(36).toUpperCase()}`
      });
      handleSuccessfulScan(mockPayload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
              <FaCamera />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Buyer QR Handover Scanner</h3>
              <p className="text-[11px] text-gray-400">Scan collector pass for verification</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-100 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeTab === "camera"
                ? "text-emerald-700 border-b-2 border-emerald-600 bg-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeTab === "upload"
                ? "text-emerald-700 border-b-2 border-emerald-600 bg-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Upload Photo
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeTab === "manual"
                ? "text-emerald-700 border-b-2 border-emerald-600 bg-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Enter Code
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {activeTab === "camera" && (
            <div className="space-y-3 text-center">
              <div
                id="buyer-qr-reader"
                className="w-full min-h-[260px] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center"
              />
              <p className="text-xs text-gray-500">
                Align the collector's Handover QR code within the frame to verify automatically.
              </p>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4 text-center py-4">
              <div id="buyer-file-reader" className="hidden" />
              <label className="block p-8 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-all">
                <FaFileUpload className="text-4xl text-emerald-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-gray-800 block">Choose QR Image File</span>
                <span className="text-[11px] text-gray-500">PNG, JPG, or Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === "manual" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Paste QR Code JSON or Reference:
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder='{"type":"kabadiwala-handover-v2","certificateId":"KBC-..."}'
                rows={4}
                className="w-full p-3 rounded-xl border border-gray-300 font-mono text-xs focus:outline-emerald-600"
              />
              <button
                onClick={handleManualSubmit}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <FaCheck />
                <span>Verify Payload</span>
              </button>
            </div>
          )}

          {/* 1-Click Fast Test Button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleFastDemoScan}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-300/60 transition-all active:scale-98"
            >
              <FaBolt className="text-amber-500" />
              <span>⚡ 1-Click Demo Scan Active Collector Handover</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
