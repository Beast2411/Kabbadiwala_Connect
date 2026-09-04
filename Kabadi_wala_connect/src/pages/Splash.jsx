import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { APP_NAME } from "../utils/constants";
import { useApp } from "../context/AppContext";

export const Splash = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && user.isLoggedIn) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-emerald-gradient flex flex-col items-center justify-between p-6 text-white text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl mb-6 shadow-2xl border border-white/30"
        >
          ♻️
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-extrabold tracking-tight"
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-emerald-100 font-medium text-sm mt-2 max-w-xs"
        >
          Smart Scrap Trading Platform for Collectors & Recyclers
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="pb-8 flex flex-col items-center space-y-3"
      >
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-white/80 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
        <span className="text-xs font-semibold text-emerald-200 tracking-wider uppercase">
          Powered by SIH Innovation
        </span>
      </motion.div>
    </div>
  );
};
