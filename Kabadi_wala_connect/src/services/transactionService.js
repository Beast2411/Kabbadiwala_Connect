import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { formatDateLabel, MATERIAL_ICONS } from "../utils/helpers";
import { mockTransactions, mockUser } from "../data/mockData";

const mapTransaction = (tx, lot, recycler) => {
  const material = Array.isArray(lot?.materials) ? lot.materials[0] : lot?.materials;
  const materialName =
    typeof material === "object" ? material?.name || material?.category : material || "Scrap";

  return {
    id: tx.id,
    date: formatDateLabel(tx.created_at),
    materialName,
    icon: MATERIAL_ICONS[materialName] || "📦",
    weightKg: lot?.total_weight || 0,
    pricePerKg: lot?.estimated_value && lot?.total_weight
      ? Math.round(lot.estimated_value / lot.total_weight)
      : 0,
    totalAmount: Number(tx.final_price || tx.quoted_price || lot?.estimated_value || 0),
    recyclerName: recycler?.name || "Recycler",
    status: tx.payment_status === "paid" ? "Completed" : tx.payment_status || "Pending"
  };
};

export const getCollectorTransactions = async (collectorId) => {
  if (!isSupabaseConfigured) return mockTransactions;

  const { data: lots, error: lotsError } = await supabase
    .from("lots")
    .select("id, materials, total_weight, estimated_value")
    .eq("collector_id", collectorId);

  if (lotsError) throw new Error(lotsError.message);
  if (!lots?.length) return [];

  const lotIds = lots.map((l) => l.id);
  const lotMap = Object.fromEntries(lots.map((l) => [l.id, l]));

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*, recyclers(name)")
    .in("lot_id", lotIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (transactions || []).map((tx) =>
    mapTransaction(tx, lotMap[tx.lot_id], tx.recyclers)
  );
};

export const getCollectorEarningsSummary = async (collectorId) => {
  if (!isSupabaseConfigured) {
    return {
      totalEarnings: mockUser.totalEarnings,
      todayEarnings: mockUser.todayEarnings,
      monthlyEarnings: mockUser.monthlyEarnings,
      completedDeals: mockUser.completedDeals
    };
  }

  const transactions = await getCollectorTransactions(collectorId);
  const now = new Date();
  const todayStr = now.toDateString();
  const month = now.getMonth();
  const year = now.getFullYear();

  let totalEarnings = 0;
  let todayEarnings = 0;
  let monthlyEarnings = 0;

  for (const tx of transactions) {
    totalEarnings += tx.totalAmount;
  }

  const { data: rawTx } = await supabase
    .from("transactions")
    .select("final_price, quoted_price, created_at, lots!inner(collector_id)")
    .eq("lots.collector_id", collectorId);

  for (const tx of rawTx || []) {
    const amount = Number(tx.final_price || tx.quoted_price || 0);
    const d = new Date(tx.created_at);
    if (d.toDateString() === todayStr) todayEarnings += amount;
    if (d.getMonth() === month && d.getFullYear() === year) monthlyEarnings += amount;
  }

  return {
    totalEarnings,
    todayEarnings,
    monthlyEarnings,
    completedDeals: transactions.filter((t) => t.status === "Completed").length
  };
};

export const createTransaction = async ({
  lotId,
  recyclerId,
  quotedPrice,
  finalPrice,
  handoverRef
}) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      lot_id: lotId,
      recycler_id: recyclerId,
      quoted_price: quotedPrice,
      final_price: finalPrice,
      handover_ref: handoverRef,
      payment_status: "pending"
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const confirmHandover = async (transactionId, finalPrice) => {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      final_price: finalPrice,
      payment_status: "paid",
      updated_at: new Date().toISOString()
    })
    .eq("id", transactionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
