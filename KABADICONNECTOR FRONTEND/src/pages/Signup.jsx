import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LanguageSelector } from "../components/LanguageSelector";
import { validatePhoneNumber } from "../utils/helpers";
import { registerCollector } from "../services/authService";
import { getCurrentLocation } from "../services/locationService";
import { useApp } from "../context/AppContext";
import { DEFAULT_COUNTRY_CODE } from "../utils/constants";
import { FaUser, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

export const Signup = () => {
  const navigate = useNavigate();
  const { changeLanguage, language, t } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }
    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await registerCollector({
        name: name.trim(),
        phone,
        preferredLanguage: language,
        locationLat: location?.lat ?? null,
        locationLng: location?.lng ?? null
      });
      navigate("/otp", {
        state: { phone, isNewUser: true, demoPin: res.demoPin, name: name.trim() }
      });
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 max-w-md mx-auto">
      <div className="pt-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-emerald-600/30">
            ♻️
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create Collector Account</h1>
          <p className="text-sm text-gray-600 mt-1">
            Register to sync your scrap sales with the platform
          </p>
        </motion.div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t("enterPhone") || "Mobile Number"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-extrabold text-gray-700 border-r border-gray-300 pr-3">
                  {DEFAULT_COUNTRY_CODE}
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={t("phonePlaceholder") || "98765 43210"}
                  className="w-full pl-20 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 text-lg font-bold focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t("selectLanguage") || "Preferred Language"}
              </label>
              <LanguageSelector
                selectedLanguage={language}
                onSelect={(langId) => changeLanguage(langId)}
                compact
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Your Location (optional)
              </label>
              <Button
                type="button"
                variant="secondary"
                size="md"
                loading={locating}
                onClick={handleUseLocation}
                icon={FaMapMarkerAlt}
                className="w-full"
              >
                {location ? "Location captured ✓" : "Use GPS Location"}
              </Button>
              {location && (
                <p className="text-xs text-emerald-700 font-medium mt-2">
                  {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs font-bold text-red-600">⚠️ {error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!name.trim() || phone.length !== 10}
              icon={FaArrowRight}
            >
              Continue — Send Verification Code
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Log in
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Are you a scrap buyer?{" "}
          <Link to="/buyer/register" className="font-bold text-emerald-700 hover:underline">
            Register as Buyer
          </Link>
        </p>
      </div>
    </div>
  );
};
