import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { BottomNavigation } from "../components/BottomNavigation";
import { Card } from "../components/Card";
import { Loader } from "../components/Loader";
import {
  getCollectorTransactions,
  getCollectorEarningsSummary
} from "../services/transactionService";
import { formatCurrency } from "../utils/helpers";
import { useApp } from "../context/AppContext";
import { FaWallet, FaArrowUp, FaCheckCircle, FaHistory } from "react-icons/fa";

export const Earnings = () => {
  const { t, user } = useApp();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      getCollectorEarningsSummary(user.id),
      getCollectorTransactions(user.id)
    ])
      .then(([s, txs]) => {
        setSummary(s);
        setTransactions(txs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Navbar title={t("earnings") || "My Earnings"} />
        <Loader message="Loading earnings from database..." />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title={t("earnings") || "My Earnings"} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        <Card className="p-6 bg-emerald-gradient text-white shadow-soft relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Total Scrap Payouts
              </span>
              <h2 className="text-4xl font-extrabold mt-2 tracking-tight">
                {formatCurrency(summary?.totalEarnings || 0)}
              </h2>
              <p className="text-xs text-emerald-100 mt-1 font-medium">
                {summary?.completedDeals || 0} Successful Deals Completed
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              <FaWallet />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-emerald-50/50 border-emerald-100">
            <span className="text-[10px] font-bold uppercase text-emerald-700">Today's Sales</span>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">
              {formatCurrency(summary?.todayEarnings || 0)}
            </p>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center mt-1">
              <FaArrowUp className="mr-1 text-[8px]" /> Synced live
            </span>
          </Card>

          <Card className="p-4 bg-blue-50/50 border-blue-100">
            <span className="text-[10px] font-bold uppercase text-blue-700">This Month</span>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">
              {formatCurrency(summary?.monthlyEarnings || 0)}
            </p>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider flex items-center">
              <FaHistory className="mr-1.5" /> Recent Sales History
            </h3>
          </div>

          {transactions.length === 0 ? (
            <Card className="p-6 text-center text-sm text-gray-500">
              No transactions yet. Create a lot and sell to a buyer to see earnings here.
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Card key={tx.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{tx.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm">
                          {tx.materialName} ({Number(tx.weightKg || 0).toFixed(2)} kg)
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          {tx.recyclerName} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-700">
                        +{formatCurrency(tx.totalAmount)}
                      </span>
                      <span className="text-[10px] block font-bold text-emerald-600 flex items-center justify-end mt-0.5">
                        <FaCheckCircle className="text-[10px] mr-1" /> {tx.status}
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
