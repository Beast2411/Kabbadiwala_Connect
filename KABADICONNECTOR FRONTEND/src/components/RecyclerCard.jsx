import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaDirections } from "react-icons/fa";
import { formatDistance } from "../utils/helpers";
import { useApp } from "../context/AppContext";
import { getRecyclerRatingStats } from "../services/reviewService";

export const RecyclerCard = ({ recycler }) => {
  const navigate = useNavigate();
  const { setSelectedRecycler, t } = useApp();

  const stats = getRecyclerRatingStats(
    recycler.id,
    recycler.rating || 4.7,
    recycler.reviewsCount || 40
  );

  const handleSelect = () => {
    setSelectedRecycler(recycler);
    navigate(`/recycler/${recycler.id}`);
  };

  const handleCall = (e) => {
    e.stopPropagation();
    window.location.href = `tel:${recycler.phone}`;
  };

  const handleNavigate = (e) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/search/?api=1&query=${recycler.lat},${recycler.lng}`;
    window.open(url, "_blank");
  };

  return (
    <Card onClick={handleSelect} className="mb-4 hover:border-emerald-300 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-gray-900 text-lg leading-snug">
              {recycler.name}
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Owner: {recycler.ownerName}</p>
        </div>

        <div className="flex items-center bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl shrink-0">
          <FaStar className="text-amber-500 text-xs mr-1" />
          <span className="text-xs font-extrabold text-amber-900">{stats.averageRating}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 my-2.5 flex-wrap gap-y-1">
        {recycler.verified && <StatusBadge type="verified" />}
        {recycler.pickupAvailable && <StatusBadge type="pickup" />}
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          {recycler.rateBonus}
        </span>
      </div>

      <div className="flex items-center text-xs text-gray-600 mt-2">
        <FaMapMarkerAlt className="text-emerald-600 mr-1.5 shrink-0" />
        <span className="truncate">{recycler.address}</span>
        <span className="ml-auto font-extrabold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg shrink-0">
          {formatDistance(recycler.distanceKm)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCall}
          icon={FaPhoneAlt}
        >
          {t("callNow") || "Call"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleNavigate}
          icon={FaDirections}
        >
          {t("navigate") || "Navigate"}
        </Button>
      </div>
    </Card>
  );
};
