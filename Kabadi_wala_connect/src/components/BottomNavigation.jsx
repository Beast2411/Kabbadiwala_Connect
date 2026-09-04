import React from "react";
import { NavLink } from "react-router-dom";
import { 
  MdDashboard, 
  MdCameraAlt, 
  MdAttachMoney, 
  MdMap, 
  MdPerson 
} from "react-icons/md";
import { useApp } from "../context/AppContext";

export const BottomNavigation = () => {
  const { t } = useApp();

  const navItems = [
    { path: "/dashboard", label: t("dashboard") || "Home", icon: MdDashboard },
    { path: "/prices", label: t("todayPrices") || "Prices", icon: MdAttachMoney },
    { path: "/scan", label: t("scanItem") || "Scan", icon: MdCameraAlt, highlight: true },
    { path: "/recyclers", label: t("nearbyRecyclers") || "Buyers", icon: MdMap },
    { path: "/profile", label: t("profile") || "Profile", icon: MdPerson }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                item.highlight
                  ? "bg-emerald-600 text-white -mt-5 p-3.5 shadow-lg shadow-emerald-600/40 rounded-full"
                  : isActive
                  ? "text-emerald-600 font-bold bg-emerald-50"
                  : "text-gray-500 hover:text-gray-800 font-medium"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={item.highlight ? "text-2xl" : "text-xl mb-0.5"} />
                {!item.highlight && (
                  <span className={`text-[10px] ${isActive ? "font-bold text-emerald-700" : ""}`}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
