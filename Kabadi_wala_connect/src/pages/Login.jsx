import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { validatePhoneNumber } from "../utils/helpers";
import { sendOTP } from "../services/authService";
import { useApp } from "../context/AppContext";
import { DEFAULT_COUNTRY_CODE } from "../utils/constants";
import { FaPhoneAlt, FaArrowRight } from "react-icons/fa";

export const Login = () => {
  const navigate = useNavigate();
  const { t } = useApp();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOTP(phone);
      navigate("/otp", { state: { phone, demoPin: res.demoPin } });
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 max-w-md mx-auto">
      <div className="pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-emerald-600/30">
            ♻️
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {t("login") || "Mobile Login"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter your phone number to start selling scrap
          </p>
        </motion.div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t("enterPhone") || "Mobile Phone Number"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-extrabold text-gray-700 text-base border-r border-gray-300 pr-3">
                  {DEFAULT_COUNTRY_CODE}
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder={t("phonePlaceholder") || "98765 43210"}
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(cleaned);
                    if (error) setError("");
                  }}
                  className="w-full pl-20 pr-4 py-4 rounded-2xl border-2 border-gray-200 text-lg font-bold text-gray-900 focus:border-emerald-600 focus:bg-emerald-50/30 focus:outline-none transition-all"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs font-bold text-red-600 mt-2 flex items-center">
                  ⚠️ {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={phone.length !== 10}
              icon={FaArrowRight}
            >
              {t("sendOTP") || "Continue with OTP"}
            </Button>
          </form>
        </Card>
      </div>

      <div className="py-4 text-center space-y-2">
        <p className="text-sm text-gray-600">
          New collector?{" "}
          <Link to="/signup" className="font-bold text-emerald-700 hover:underline">
            Create account
          </Link>
        </p>
        <p className="text-sm text-gray-500">
          Scrap buyer?{" "}
          <Link to="/buyer/login" className="font-bold text-emerald-700 hover:underline">
            Buyer portal
          </Link>
        </p>
        <p className="text-xs text-gray-400 font-medium pt-2">
          By continuing, you agree to Kabadiwala Connect Terms & Safety Protocols.
        </p>
      </div>
    </div>
  );
};
