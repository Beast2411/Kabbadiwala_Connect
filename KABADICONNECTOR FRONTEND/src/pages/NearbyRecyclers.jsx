import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { RecyclerCard } from "../components/RecyclerCard";
import { Loader } from "../components/Loader";
import { getNearbyRecyclers } from "../services/recyclerService";
import { SCRAP_CATEGORIES } from "../utils/constants";
import { useApp } from "../context/AppContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Leaflet icon fix for React Vite bundling
const customMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const NearbyRecyclers = () => {
  const { userLocation, t } = useApp();
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchRecyclers = async () => {
      setLoading(true);
      try {
        const list = await getNearbyRecyclers(userLocation, selectedCategory);
        setRecyclers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecyclers();
  }, [selectedCategory, userLocation]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("nearbyRecyclers") || "Nearby Recyclers"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Leaflet Map Header Section */}
        <div className="h-52 rounded-3xl overflow-hidden shadow-card border border-gray-200 relative">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {recyclers.map((r) => (
              <Marker key={r.id} position={[r.lat, r.lng]} icon={customMarkerIcon}>
                <Popup>
                  <div className="font-sans">
                    <strong className="text-sm font-bold text-gray-900">{r.name}</strong>
                    <p className="text-xs text-gray-600 m-0">{r.address}</p>
                    <span className="text-xs font-bold text-emerald-600">{r.distanceKm} km away</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SCRAP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Recyclers Cards List */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              {recyclers.length} Verified Recyclers Found
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
              Sorted by Distance
            </span>
          </div>

          {loading ? (
            <Loader message="Finding nearby scrap buyers..." />
          ) : recyclers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 text-sm font-medium">No buyers found for this category.</p>
            </div>
          ) : (
            <div>
              {recyclers.map((recycler) => (
                <RecyclerCard key={recycler.id} recycler={recycler} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
