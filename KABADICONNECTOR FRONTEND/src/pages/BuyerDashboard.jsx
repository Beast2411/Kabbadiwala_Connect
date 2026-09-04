import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { supabase } from "../lib/supabase";
import { getCurrentBuyer, logoutBuyer } from "../services/authService";
import { getOpenLots } from "../services/lotService";
import { getAllRecyclers } from "../services/recyclerService";
import { createTransaction, confirmHandover } from "../services/transactionService";
import { updateLotStatus } from "../services/lotService";
import { formatCurrency } from "../utils/helpers";

export const BuyerDashboard = () => {
  const navigate = useNavigate();
  const buyer = getCurrentBuyer();
  const [lots, setLots] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [openLots, allRecyclers] = await Promise.all([getOpenLots(), getAllRecyclers()]);
      setLots(openLots);
      setRecyclers(allRecyclers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptLot = async (lot) => {
    if (!buyer.id) return;
    try {
      await createTransaction({
        lotId: lot.id,
        recyclerId: buyer.id,
        quotedPrice: lot.estimated_value,
        finalPrice: null,
        handoverRef: `HO-${Date.now()}`
      });
      await updateLotStatus(lot.id, "matched");
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmPayment = async (lot) => {
    try {
      const { data: txs, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("lot_id", lot.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const tx = txs?.[0];
      if (tx) {
        await confirmHandover(tx.id, lot.estimated_value);
        await updateLotStatus(lot.id, "paid");
        await loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await logoutBuyer();
    navigate("/buyer/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Navbar title="Buyer Dashboard" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        <Card className="p-5 bg-gray-900 text-white">
          <h2 className="text-xl font-extrabold">{buyer.name}</h2>
          <p className="text-xs text-gray-300 mt-1">{buyer.email}</p>
          <p className="text-xs text-emerald-300 mt-2">
            {recyclers.length} buyers on platform • {lots.length} open lots
          </p>
        </Card>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate("/buyer/register")}>
            Add Another Depot
          </Button>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Log Out
          </Button>
        </div>

        <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
          Incoming Collector Lots
        </h3>

        {loading ? (
          <Loader message="Syncing lots from database..." />
        ) : lots.length === 0 ? (
          <Card className="p-6 text-center text-sm text-gray-500">
            No open lots yet. Collectors will appear here when they create scrap lots.
          </Card>
        ) : (
          lots.map((lot) => (
            <Card key={lot.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-gray-900">
                    {lot.collectors?.name || "Collector"} — {lot.total_weight} kg
                  </h4>
                  <p className="text-xs text-gray-500">
                    Est. {formatCurrency(lot.estimated_value)} • Status: {lot.status}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(lot.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {lot.status === "created" && (
                  <Button size="sm" variant="primary" onClick={() => handleAcceptLot(lot)}>
                    Accept Lot
                  </Button>
                )}
                {lot.status === "matched" && (
                  <Button size="sm" variant="secondary" onClick={() => handleConfirmPayment(lot)}>
                    Confirm Cash Payment
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}

        <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider pt-2">
          All Registered Buyers (synced)
        </h3>
        {recyclers.slice(0, 5).map((r) => (
          <Card key={r.id} className="p-3">
            <p className="font-bold text-sm">{r.name}</p>
            <p className="text-xs text-gray-500">
              {r.verified ? "✓ Authorized" : "Pending auth"} • {r.phone || r.contact}
            </p>
          </Card>
        ))}
      </main>
    </div>
  );
};
