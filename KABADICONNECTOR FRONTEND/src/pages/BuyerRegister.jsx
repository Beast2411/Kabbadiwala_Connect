import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { registerBuyer } from "../services/authService";
import { getCurrentLocation } from "../services/locationService";
import { SCRAP_CATEGORIES } from "../utils/constants";
import { FaStore, FaEnvelope, FaLock, FaMapMarkerAlt } from "react-icons/fa";

const BUYER_CATEGORIES = SCRAP_CATEGORIES.filter((c) => c.id !== "all");

export const BuyerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    registrationId: "",
    pickupAvailable: false,
    materialsAccepted: []
  });
  const [location, setLocation] = useState(null);
  const [offeredRates, setOfferedRates] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleCategory = (catId) => {
    setForm((f) => ({
      ...f,
      materialsAccepted: f.materialsAccepted.includes(catId)
        ? f.materialsAccepted.filter((c) => c !== catId)
        : [...f.materialsAccepted, catId]
    }));
  };

  const handleLocation = async () => {
    const loc = await getCurrentLocation();
    setLocation(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Business name is required");
    if (!form.email.includes("@")) return setError("Valid email is required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (!form.materialsAccepted.length) return setError("Select at least one material category");

    setLoading(true);
    try {
      await registerBuyer({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        contact: form.contact || form.email,
        registrationId: form.registrationId,
        locationLat: location?.lat ?? 19.076,
        locationLng: location?.lng ?? 72.8777,
        materialsAccepted: form.materialsAccepted,
        offeredRates,
        pickupAvailable: form.pickupAvailable
      });
      navigate("/buyer/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center pt-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-3xl mx-auto mb-3">
            <FaStore />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Register as Buyer</h1>
          <p className="text-sm text-gray-600 mt-1">
            List your scrap depot — data syncs to the web instantly
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Business / Depot Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold focus:border-emerald-600 focus:outline-none"
            />
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Business Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <input
              type="tel"
              placeholder="Contact Phone (optional)"
              value={form.contact}
              onChange={(e) => update("contact", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="MPCB Registration ID (optional)"
              value={form.registrationId}
              onChange={(e) => update("registrationId", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold focus:border-emerald-600 focus:outline-none"
            />

            <Button type="button" variant="secondary" size="md" icon={FaMapMarkerAlt} onClick={handleLocation} className="w-full">
              {location ? "GPS Location Set ✓" : "Set Depot GPS Location"}
            </Button>

            <div>
              <p className="text-xs font-bold text-gray-600 uppercase mb-2">Materials Accepted</p>
              <div className="flex flex-wrap gap-2">
                {BUYER_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      form.materialsAccepted.includes(cat.id)
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 uppercase mb-2">Offered Rates (₹/kg)</p>
              {form.materialsAccepted.map((cat) => (
                <div key={cat} className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold w-24 capitalize">{cat}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate"
                    value={offeredRates[cat] || ""}
                    onChange={(e) =>
                      setOfferedRates((r) => ({ ...r, [cat]: Number(e.target.value) }))
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold"
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={form.pickupAvailable}
                onChange={(e) => update("pickupAvailable", e.target.checked)}
                className="rounded"
              />
              Doorstep pickup available
            </label>

            {error && <p className="text-xs font-bold text-red-600">⚠️ {error}</p>}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Register Buyer Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already registered?{" "}
          <Link to="/buyer/login" className="font-bold text-emerald-700 hover:underline">
            Buyer Login
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          <Link to="/signup" className="font-bold text-emerald-700 hover:underline">
            Collector Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
