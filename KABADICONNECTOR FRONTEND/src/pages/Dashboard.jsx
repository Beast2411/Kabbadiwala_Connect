import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Loader } from "../components/Loader";
import { useApp } from "../context/AppContext";
import { getPriceBoard } from "../services/priceService";
import { formatCurrency } from "../utils/helpers";
import {
  MdCameraAlt,
  MdAttachMoney,
  MdMap,
  MdAccountBalanceWallet,
  MdSecurity,
  MdPerson,
  MdSearch
} from "react-icons/md";
import { FaChevronRight } from "react-icons/fa";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, t } = useApp();
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPriceBoard()
      .then(setMaterials)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greetingName = user?.name?.split(" ")[0] || "Collector";

  const featureCards = [
    { id: "scan", title: t("scanItem"), desc: "Instant AI price estimation", icon: MdCameraAlt, path: "/scan", bgGradient: "from-emerald-500 to-emerald-700", textColor: "text-white" },
    { id: "prices", title: t("todayPrices"), desc: "Live scrap market rates", icon: MdAttachMoney, path: "/prices", bgGradient: "from-blue-600 to-indigo-700", textColor: "text-white" },
    { id: "recyclers", title: t("nearbyRecyclers"), desc: "Find verified recyclers", icon: MdMap, path: "/recyclers", bgGradient: "from-purple-600 to-violet-700", textColor: "text-white" },
    { id: "earnings", title: t("earnings"), desc: "Track sales & payouts", icon: MdAccountBalanceWallet, path: "/earnings", bgGradient: "from-amber-500 to-orange-600", textColor: "text-white" },
    { id: "safety", title: t("safetyGuide"), desc: "Hazardous handling rules", icon: MdSecurity, path: "/safety", bgGradient: "from-rose-500 to-red-600", textColor: "text-white" },
    { id: "profile", title: t("profile"), desc: "Account settings", icon: MdPerson, path: "/profile", bgGradient: "from-teal-600 to-cyan-700", textColor: "text-white" }
  ];

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.hindiName && m.hindiName.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar showBack={false} />

      <main className="max-w-md mx-auto p-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-gradient p-6 rounded-3xl text-white shadow-soft relative overflow-hidden"
        >
          <div className="relative z-10">
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Namaste, {greetingName}!
            </span>
            <h2 className="text-2xl font-extrabold mt-2 leading-tight">Ready to sell scrap today?</h2>
            <p className="text-emerald-100 text-xs mt-1 font-medium">
              {t("subtitle")} • Data synced to cloud
            </p>
          </div>
          <div className="absolute right-[-10px] bottom-[-20px] text-8xl opacity-15 select-none">♻️</div>
        </motion.div>

        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search material rate (e.g. Copper, Battery)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-card"
          />
        </div>

        {searchQuery && (
          <Card className="p-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">Search Results</h4>
            {filteredMaterials.length === 0 ? (
              <p className="text-xs text-gray-500 p-2">No matching material found</p>
            ) : (
              <div className="space-y-1">
                {filteredMaterials.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate("/prices")}
                    className="flex justify-between items-center p-2 rounded-xl hover:bg-emerald-50 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-gray-800">{m.icon} {m.name}</span>
                    <span className="text-xs font-extrabold text-emerald-700">{formatCurrency(m.pricePerKg)}/kg</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div>
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {featureCards.map((card) => (
              <motion.div
                key={card.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(card.path)}
                className={`bg-gradient-to-br ${card.bgGradient} p-4 rounded-3xl ${card.textColor} shadow-md flex flex-col justify-between cursor-pointer min-h-[120px]`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                  <card.icon />
                </div>
                <div>
                  <h4 className="font-extrabold text-base leading-tight mt-2">{card.title}</h4>
                  <p className="text-[11px] opacity-80 font-medium mt-0.5">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Top Scrap Rates Today</h3>
            <button onClick={() => navigate("/prices")} className="text-xs font-bold text-emerald-700 flex items-center hover:underline">
              View All <FaChevronRight className="text-[10px] ml-1" />
            </button>
          </div>

          {loading ? (
            <Loader message="Loading rates..." />
          ) : (
            <div className="space-y-2.5">
              {materials.slice(0, 3).map((mat) => (
                <Card key={mat.id} onClick={() => navigate("/prices")} className="p-3.5 hover:border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{mat.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm">{mat.name}</h4>
                        <p className="text-[11px] text-gray-500 font-medium">Live from Supabase</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-700">{formatCurrency(mat.pricePerKg)}</span>
                      <span className="text-[10px] block font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5">
                        {mat.change}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
