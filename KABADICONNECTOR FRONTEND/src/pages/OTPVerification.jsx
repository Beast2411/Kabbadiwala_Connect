import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { OTPInput } from "../components/OTPInput";
import { verifyOTP, resendOTP } from "../services/authService";
import { useApp } from "../context/AppContext";
import { OTP_EXPIRY_SECONDS, DEFAULT_COUNTRY_CODE } from "../utils/constants";
import { FaCheckCircle } from "react-icons/fa";

export const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, t } = useApp();

  const phone = location.state?.phone || "9876543210";
  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(OTP_EXPIRY_SECONDS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleVerify = async () => {
    setError("");
    if (otpCode.length !== 6) {
      setError("Please enter the full 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(otpCode);
      setUser(res.user);
      navigate("/language-selection");
    } catch (err) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(OTP_EXPIRY_SECONDS);
    setError("");
    await resendOTP(phone);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 max-w-md mx-auto">
      <div className="pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-200">
            <FaCheckCircle />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {t("verifyOTP") || "Verify Phone"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Sent 6-digit code to <span className="font-bold text-gray-900">{DEFAULT_COUNTRY_CODE} {phone}</span>
          </p>
        </motion.div>

        <Card className="p-6">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider text-center mb-1">
            {t("enterOTP") || "Enter 6-Digit OTP"}
          </label>

          <OTPInput length={6} onChangeOTP={(val) => setOtpCode(val)} />

          {error && (
            <p className="text-xs font-bold text-red-600 mb-4 text-center">
              ⚠️ {error}
            </p>
          )}

          <div className="text-center my-4">
            {timer > 0 ? (
              <p className="text-xs text-gray-500 font-medium">
                Resend OTP in <span className="font-bold text-emerald-700">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                {t("resendOTP") || "Resend OTP Code"}
              </button>
            )}
          </div>

          <Button
            onClick={handleVerify}
            variant="primary"
            size="lg"
            loading={loading}
            disabled={otpCode.length !== 6}
          >
            {t("verifyOTP") || "Verify & Log In"}
          </Button>
        </Card>
      </div>

      <div className="py-6 text-center text-xs text-gray-500 font-medium">
        Demo Tip: You can type any 6 digits (e.g. <span className="font-bold">123456</span>) to verify.
      </div>
    </div>
  );
};
