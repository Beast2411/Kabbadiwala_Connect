import React from "react";
import { FaCheckCircle, FaTruck, FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

export const StatusBadge = ({ type, text, className = "" }) => {
  if (type === "verified") {
    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
        <FaCheckCircle className="text-emerald-600 text-xs" />
        <span>{text || "Verified Buyer"}</span>
      </span>
    );
  }

  if (type === "pickup") {
    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
        <FaTruck className="text-blue-600 text-xs" />
        <span>{text || "Pickup Available"}</span>
      </span>
    );
  }

  if (type === "up") {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 ${className}`}>
        <FaArrowUp className="text-[10px]" />
        <span>{text}</span>
      </span>
    );
  }

  if (type === "down") {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 ${className}`}>
        <FaArrowDown className="text-[10px]" />
        <span>{text}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 ${className}`}>
      <FaMinus className="text-[10px]" />
      <span>{text || "Stable"}</span>
    </span>
  );
};
