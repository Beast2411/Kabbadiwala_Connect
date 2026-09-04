import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { scanMaterial } from "../services/estimateService";
import { useApp } from "../context/AppContext";
import { MdCameraAlt, MdCloudUpload, MdCheckCircle, MdAdd } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { formatCurrency } from "../utils/helpers";

export const ScanItem = () => {
  const navigate = useNavigate();
  const { setActiveItem, addToBag, bagItems, t } = useApp();

  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [addedToBag, setAddedToBag] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      setScanResult(null);
      setAddedToBag(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      const res = await scanMaterial(imagePreview);
      setScanResult(res);
      setActiveItem(res.detectedMaterial);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleProceedToValue = () => {
    if (scanResult) {
      navigate("/estimated-value", {
        state: {
          scanResult,
          imagePreview
        }
      });
    }
  };

  const handleAddToBag = () => {
    addToBag(scanResult.detectedMaterial, imagePreview);
    setAddedToBag(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("scanItem") || "Scan Material"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        <Card className="p-6 text-center border-dashed border-2 border-emerald-300 bg-emerald-50/30">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden max-h-56 bg-black flex items-center justify-center shadow-md">
                <img src={imagePreview} alt="Scrap preview" className="w-full object-cover max-h-56" />
                {scanning && (
                  <div className="absolute inset-0 bg-emerald-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">AI Material Scan...</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <label className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white font-bold text-xs text-gray-700 cursor-pointer text-center hover:bg-gray-50">
                  Retake Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleTriggerScan}
                  loading={scanning}
                  className="flex-1"
                >
                  Analyze Item
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
                <MdCameraAlt />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Upload or Take Photo</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  Point camera at copper wire, battery, circuit board, or plastic scrap
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="py-3 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md active:scale-95 transition-all">
                  <MdCameraAlt className="text-lg" />
                  <span>Use Camera</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                </label>

                <label className="py-3 px-4 rounded-2xl bg-white border border-gray-300 text-gray-800 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-95 transition-all">
                  <MdCloudUpload className="text-lg text-emerald-600" />
                  <span>Upload File</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </Card>

        {/* Scan Results Card */}
        {scanResult && (
          <Card className="p-5 border-2 border-emerald-500 bg-emerald-50/50 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{scanResult.detectedMaterial.icon}</span>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <MdCheckCircle className="text-emerald-600 text-base" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {scanResult.confidence}% AI Match
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-xl mt-0.5">
                    {scanResult.detectedMaterial.name}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-gray-500">Market Rate</span>
                <p className="text-xl font-extrabold text-emerald-700">
                  {formatCurrency(scanResult.detectedMaterial.pricePerKg)}/kg
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium mt-3 bg-white p-3 rounded-xl border border-emerald-100">
              💡 {scanResult.detectedMaterial.shortDescription}
            </p>

            {scanResult.predictions?.length > 1 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                  Other possible matches
                </p>
                {scanResult.predictions.slice(1).map((prediction) => (
                  <div key={prediction.label} className="flex justify-between text-xs text-gray-600">
                    <span>{prediction.label}</span>
                    <span className="font-bold">{prediction.confidence}%</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button onClick={handleAddToBag} variant="secondary" size="md" icon={FaShoppingBag}>
                {addedToBag ? "Added to Bag" : "Add to Bag"}
              </Button>
              <Button onClick={handleProceedToValue} variant="primary" size="md" icon={MdAdd}>
                Sell This Item
              </Button>
            </div>
            <Button onClick={() => navigate("/bag")} variant="ghost" size="sm" className="w-full mt-2">
              View Bag ({bagItems.length})
            </Button>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};
