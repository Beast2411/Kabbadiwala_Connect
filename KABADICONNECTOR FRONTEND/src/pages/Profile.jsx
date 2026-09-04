import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useApp } from "../context/AppContext";
import { logoutUser } from "../services/authService";
import { LANGUAGES, HELPLINE_NUMBER } from "../utils/constants";
import { FaUserCircle, FaGlobe, FaPhoneAlt, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";

export const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, language, t } = useApp();

  const currentLangObj = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("profile") || "My Profile"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* User Details Card */}
        <Card className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-5xl mx-auto mb-3 shadow-inner">
            <FaUserCircle />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">{user?.name || "Ramesh Kumar"}</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            +91 {user?.phone || "98765 43210"}
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            Registered Scrap Collector
          </span>
        </Card>

        {/* Settings List */}
        <Card className="p-2 divide-y divide-gray-100">
          <div
            onClick={() => navigate("/language-selection")}
            className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <FaGlobe className="text-emerald-600 text-lg" />
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm">Language / भाषा</h4>
                <p className="text-xs text-gray-500 font-medium">{currentLangObj.nativeName}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              Change
            </span>
          </div>

          <div
            onClick={() => navigate("/safety")}
            className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-emerald-600 text-lg" />
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm">Safety Guidance</h4>
                <p className="text-xs text-gray-500 font-medium">Handling hazardous materials</p>
              </div>
            </div>
          </div>

          <a
            href={`tel:${HELPLINE_NUMBER}`}
            className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <FaPhoneAlt className="text-emerald-600 text-lg" />
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm">Collector Support Helpline</h4>
                <p className="text-xs text-gray-500 font-medium">{HELPLINE_NUMBER}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              Toll Free
            </span>
          </a>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="danger"
          size="lg"
          icon={FaSignOutAlt}
        >
          {t("logout") || "Log Out"}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};
