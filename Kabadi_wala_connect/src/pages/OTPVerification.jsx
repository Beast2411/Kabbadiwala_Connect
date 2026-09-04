import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { OTPInput } from "../components/OTPInput";
import { verifyOTP, resendOTP, getDemoPin } from "../services/authService";
import { useApp } from "../context/AppContext";
import { OTP_EXPIRY_SECONDS, DEFAULT_COUNTRY_CODE } from "../utils/constants";
import { FaCheckCircle } from "react-icons/fa";

export const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, t } = useApp();

  const phone = location.state?.phone || "9876543210";
  const [demoPin, setDemoPin] = useState(
    location.state?.demoPin || getDemoPin()
  );
  const isNewUser = location.state?.isNewUser;
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
      const res = await verifyOTP(otpCode, phone);
      setUser(res.user);
      navigate(isNewUser ? "/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      const res = await resendOTP(phone);
      setDemoPin(res.demoPin || getDemoPin());
      setTimer(OTP_EXPIRY_SECONDS);
      setOtpCode("");
    } catch (err) {
      setError(err.message || "Could not resend the verification code");
    }
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

      <div className="py-6 text-center text-xs text-gray-500 font-medium space-y-1">
        {demoPin ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800">
            Demo mode: enter this verification code{" "}
            <span className="font-extrabold tracking-widest">{demoPin}</span>
            <span className="block text-[11px] font-medium text-emerald-700 mt-1">
              No SMS provider is configured yet.
            </span>
          </p>
        ) : (
          <p>Enter the 6-digit code sent to your phone.</p>
        )}
      </div>
    </div>
  );
};
