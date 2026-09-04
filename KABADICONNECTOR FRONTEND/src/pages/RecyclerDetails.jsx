import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../context/AppContext";
import { mockRecyclers } from "../data/mockData";
import { formatDistance } from "../utils/helpers";
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaDirections, FaClock, FaCheck, FaTruck, FaQrcode } from "react-icons/fa";

export const RecyclerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedRecycler, activeLot, t } = useApp();

  const recycler = selectedRecycler || mockRecyclers.find((r) => r.id === id) || mockRecyclers[0];

  const handleCall = () => {
    window.location.href = `tel:${recycler.phone}`;
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${recycler.lat},${recycler.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={recycler.name} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Recycler Profile Banner */}
        <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Verified Wholesaler
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2 leading-snug">
                {recycler.name}
              </h2>
              <p className="text-xs text-gray-300 font-medium mt-1">Proprietor: {recycler.ownerName}</p>
            </div>

            <div className="flex items-center bg-amber-400/20 border border-amber-400/40 px-2.5 py-1.5 rounded-2xl text-amber-300">
              <FaStar className="text-amber-400 text-sm mr-1" />
              <span className="text-sm font-extrabold">{recycler.rating}</span>
              <span className="text-[10px] text-gray-400 ml-1">({recycler.reviewsCount})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700/60">
            {recycler.verified && <StatusBadge type="verified" />}
            {recycler.pickupAvailable && <StatusBadge type="pickup" />}
            <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-700">
              {recycler.rateBonus}
            </span>
          </div>
        </Card>

        {/* Action Buttons: Call & Navigate */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCall}
            icon={FaPhoneAlt}
          >
            {t("callNow") || "Call Now"}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleNavigate}
            icon={FaDirections}
          >
            {t("navigate") || "Get Directions"}
          </Button>
        </div>

        <Button
          variant="primary"
          size="lg"
          disabled={!activeLot}
          onClick={() => navigate("/handover", { state: { lot: activeLot, recycler } })}
          icon={FaQrcode}
          className="w-full"
        >
          {activeLot ? "Start Verified Sale" : "Create a Lot to Sell"}
        </Button>

        {/* Address & Working Hours Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0 mt-0.5">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Depot Address</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">{recycler.address}</p>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                Distance: {formatDistance(recycler.distanceKm)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 pt-3 border-t border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
              <FaClock />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Working Hours</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">{recycler.openHours}</p>
              <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Open Today</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 pt-3 border-t border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0">
              <FaTruck />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Doorstep Pickup Service</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {recycler.pickupAvailable
                  ? `Available for orders above ${recycler.minPickupWeightKg} kg`
                  : "Self-bring to depot only"}
              </p>
            </div>
          </div>
        </Card>

        {/* Accepted Materials */}
        <Card className="p-5">
          <h4 className="font-extrabold text-gray-900 text-sm mb-3">Accepted Scrap Materials</h4>
          <div className="grid grid-cols-2 gap-2">
            {["Copper & Metal", "Batteries & Motors", "E-Waste Circuit Boards", "HDPE Plastics"].map((mat, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <FaCheck className="text-emerald-600 text-xs shrink-0" />
                <span className="text-xs font-bold text-gray-800">{mat}</span>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};
