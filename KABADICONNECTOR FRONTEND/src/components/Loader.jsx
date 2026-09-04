import React from "react";

export const Loader = ({ fullPage = false, message = "Loading..." }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};
