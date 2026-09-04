import React from "react";
import { motion } from "framer-motion";

export const Card = ({
  children,
  className = "",
  onClick,
  hoverable = false,
  padding = "p-5"
}) => {
  const Component = onClick ? motion.div : "div";
  const motionProps = onClick
    ? {
        whileTap: { scale: 0.98 },
        whileHover: hoverable ? { y: -2 } : {}
      }
    : {};

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={`bg-white rounded-3xl border border-gray-100 shadow-card ${padding} ${
        onClick ? "cursor-pointer select-none" : ""
      } ${className}`}
    >
      {children}
    </Component>
  );
};
