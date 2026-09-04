import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Splash } from "../pages/Splash";
import { Login } from "../pages/Login";
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

export const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Splash /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/otp" element={<PageWrapper><OTPVerification /></PageWrapper>} />
        <Route path="/language-selection" element={<PageWrapper><LanguageSelection /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/scan" element={<PageWrapper><ScanItem /></PageWrapper>} />
        <Route path="/estimated-value" element={<PageWrapper><EstimatedValue /></PageWrapper>} />
        <Route path="/recyclers" element={<PageWrapper><NearbyRecyclers /></PageWrapper>} />
        <Route path="/recycler/:id" element={<PageWrapper><RecyclerDetails /></PageWrapper>} />
        <Route path="/prices" element={<PageWrapper><PriceBoard /></PageWrapper>} />
        <Route path="/earnings" element={<PageWrapper><Earnings /></PageWrapper>} />
        <Route path="/safety" element={<PageWrapper><SafetyGuide /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};
