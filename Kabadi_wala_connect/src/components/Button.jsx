import React from "react";
import { motion } from "framer-motion";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "lg",
  fullWidth = true,
  disabled = false,
  loading = false,
  icon: Icon = null,
  className = "",
  type = "button"
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation active:scale-[0.98]";

  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 active:bg-emerald-800",
    secondary:
      "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300",
    outline:
      "border-2 border-gray-300 hover:border-emerald-600 text-gray-700 hover:text-emerald-700 bg-white",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg" // Big tap targets for informal scrap collectors
  };

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-current fill-none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-3">
          {Icon && <Icon className="text-xl shrink-0" />}
          <span>{children}</span>
        </div>
      )}
    </motion.button>
  );
};
