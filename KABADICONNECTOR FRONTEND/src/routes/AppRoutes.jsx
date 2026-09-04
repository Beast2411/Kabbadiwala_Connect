import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ProtectedRoute } from "../components/ProtectedRoute";

import { Splash } from "../pages/Splash";
import { Login } from "../pages/Login";
import { Signup } from "../pages/Signup";
import { OTPVerification } from "../pages/OTPVerification";
import { LanguageSelection } from "../pages/LanguageSelection";
import { Dashboard } from "../pages/Dashboard";
import { ScanItem } from "../pages/ScanItem";
import { EstimatedValue } from "../pages/EstimatedValue";
import { NearbyRecyclers } from "../pages/NearbyRecyclers";
import { RecyclerDetails } from "../pages/RecyclerDetails";
import { PriceBoard } from "../pages/PriceBoard";
import { Earnings } from "../pages/Earnings";
import { SafetyGuide } from "../pages/SafetyGuide";
import { Profile } from "../pages/Profile";
import { NotFound } from "../pages/NotFound";
import { BuyerLogin } from "../pages/BuyerLogin";
import { BuyerRegister } from "../pages/BuyerRegister";
import { BuyerDashboard } from "../pages/BuyerDashboard";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

const CollectorRoute = ({ children }) => (
  <ProtectedRoute role="collector">
    <PageWrapper>{children}</PageWrapper>
  </ProtectedRoute>
);

const BuyerRoute = ({ children }) => (
  <ProtectedRoute role="buyer">
    <PageWrapper>{children}</PageWrapper>
  </ProtectedRoute>
);

export const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageWrapper><Splash /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/otp" element={<PageWrapper><OTPVerification /></PageWrapper>} />

        {/* Collector (protected) */}
        <Route path="/language-selection" element={<CollectorRoute><LanguageSelection /></CollectorRoute>} />
        <Route path="/dashboard" element={<CollectorRoute><Dashboard /></CollectorRoute>} />
        <Route path="/scan" element={<CollectorRoute><ScanItem /></CollectorRoute>} />
        <Route path="/estimated-value" element={<CollectorRoute><EstimatedValue /></CollectorRoute>} />
        <Route path="/recyclers" element={<CollectorRoute><NearbyRecyclers /></CollectorRoute>} />
        <Route path="/recycler/:id" element={<CollectorRoute><RecyclerDetails /></CollectorRoute>} />
        <Route path="/prices" element={<CollectorRoute><PriceBoard /></CollectorRoute>} />
        <Route path="/earnings" element={<CollectorRoute><Earnings /></CollectorRoute>} />
        <Route path="/safety" element={<CollectorRoute><SafetyGuide /></CollectorRoute>} />
        <Route path="/profile" element={<CollectorRoute><Profile /></CollectorRoute>} />

        {/* Buyer / Recycler portal */}
        <Route path="/buyer/login" element={<PageWrapper><BuyerLogin /></PageWrapper>} />
        <Route path="/buyer/register" element={<PageWrapper><BuyerRegister /></PageWrapper>} />
        <Route path="/buyer/dashboard" element={<BuyerRoute><BuyerDashboard /></BuyerRoute>} />

        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};
