import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../context/AppContext";
import { mockRecyclers } from "../data/mockData";
import { formatDistance, formatCurrency } from "../utils/helpers";
import { getRecyclerRatingStats, addRecyclerReview } from "../services/reviewService";
import {
  FaStar,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaDirections,
  FaClock,
  FaCheck,
  FaTruck,
  FaQrcode,
  FaTimes,
  FaCheckCircle
} from "react-icons/fa";

export const RecyclerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedRecycler, activeLot, user, t } = useApp();

  const recycler = selectedRecycler || mockRecyclers.find((r) => r.id === id) || mockRecyclers[0];

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userStars, setUserStars] = useState(5);
  const [userTags, setUserTags] = useState(["Fair Weight ⚖️", "Instant Cash ⚡"]);
  const [userComment, setUserComment] = useState("");
  const [submittedToast, setSubmittedToast] = useState(false);

  const stats = getRecyclerRatingStats(
    recycler.id,
    recycler.rating || 4.7,
    recycler.reviewsCount || 42
  );

  const handleCall = () => {
    window.location.href = `tel:${recycler.phone}`;
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${recycler.lat},${recycler.lng}`;
    window.open(url, "_blank");
  };

  const availableTags = [
    "Fair Weight ⚖️",
    "Instant Cash ⚡",
    "Official EPR 🌿",
    "Respectful Staff 👍",
    "Best Price 💰"
  ];

  const toggleTag = (tag) => {
    setUserTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    await addRecyclerReview({
      recyclerId: recycler.id,
      buyerName: recycler.name,
      collectorName: user?.name || "Kabadiwala Partner",
      rating: userStars,
      comment: userComment,
      tags: userTags
    });
    setRatingModalOpen(false);
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={recycler.name} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {submittedToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <FaCheckCircle className="text-emerald-300" />
            <span>Review submitted successfully!</span>
          </div>
        )}

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

            <button
              onClick={() => setRatingModalOpen(true)}
              className="flex items-center bg-amber-400/20 border border-amber-400/40 px-2.5 py-1.5 rounded-2xl text-amber-300 hover:bg-amber-400/30 transition-all cursor-pointer"
              title="Rate this buyer"
            >
              <FaStar className="text-amber-400 text-sm mr-1" />
              <span className="text-sm font-extrabold">{stats.averageRating}</span>
              <span className="text-[10px] text-gray-400 ml-1">({stats.reviewsCount})</span>
            </button>
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
            variant="secondary"
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
          className="w-full shadow-md"
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

        {/* Reviews and Ratings Section */}
        <Card className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Collector Reviews</h4>
              <p className="text-xs text-gray-500 font-medium">Verified ratings from local kabadiwalas</p>
            </div>
            <button
              onClick={() => setRatingModalOpen(true)}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all"
            >
              + Rate Buyer
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {stats.reviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-900">{rev.collectorName}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <FaStar key={idx} className="text-[10px]" />
                    ))}
                  </div>
                </div>
                {rev.comment && <p className="text-gray-600 italic mt-1">"{rev.comment}"</p>}
                {rev.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-gray-200">
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

      {/* Leave Review Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Rate {recycler.name}</h3>
                <p className="text-xs text-gray-500">Share your trading experience</p>
              </div>
              <button
                onClick={() => setRatingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="flex items-center justify-center gap-1.5 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserStars(star)}
                    className={`text-3xl transition-all ${
                      star <= userStars ? "text-amber-400 scale-110" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                      userTags.includes(tag)
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="How was the weighing accuracy and payment speed?"
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-emerald-600"
              />

              <div className="flex gap-2 pt-1">
                <Button variant="ghost" size="md" onClick={() => setRatingModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="flex-1">
                  Submit Rating
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
