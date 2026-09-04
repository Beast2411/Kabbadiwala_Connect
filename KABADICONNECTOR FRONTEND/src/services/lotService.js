import { supabase, isSupabaseConfigured } from "../lib/supabase";

const createMaterialRecord = async (materialData) => {
  if (!materialData) return null;

  const payload = {
    category: materialData.category || materialData.dbCategory || materialData.id || "metal",
    sub_category: materialData.subCategory || materialData.sub_category || null,
    description:
      materialData.description || materialData.shortDescription || materialData.name || null,
    image_url: materialData.imageUrl || materialData.image_url || null,
    weight_kg: materialData.weightKg ?? materialData.weight_kg ?? null,
    condition: materialData.condition || "mixed"
  };

  const { data, error } = await supabase
    .from("materials")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const createLot = async ({
  collectorId,
  materials,
  totalWeight,
  estimatedValue,
  photoUrls = [],
  gpsLat,
  gpsLng,
  status = "created",
  materialData = null,
  traceability = null
}) => {
  if (!isSupabaseConfigured) {
    return {
      id: `local_${Date.now()}`,
      collector_id: collectorId,
      materials,
      total_weight: totalWeight,
      estimated_value: estimatedValue,
      status,
      created_at: new Date().toISOString()
    };
  }

  const materialRow = materialData ? await createMaterialRecord(materialData) : null;
  const normalizedMaterials = materialRow
    ? [
        {
          material_id: materialRow.id,
          category: materialRow.category,
          sub_category: materialRow.sub_category,
          description: materialRow.description,
          image_url: materialRow.image_url,
          weight_kg: materialRow.weight_kg,
          condition: materialRow.condition
        }
      ]
    : Array.isArray(materials) && materials.length
      ? materials
      : [];

  const { data, error } = await supabase
    .from("lots")
    .insert({
      collector_id: collectorId,
      materials: normalizedMaterials,
      total_weight: totalWeight,
      estimated_value: estimatedValue,
      photo_urls: photoUrls,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      status
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (traceability) {
    await createTraceabilityRecord({
      lotId: data.id,
      photoUrls: traceability.photoUrls || photoUrls,
      weight: traceability.weight ?? totalWeight,
      gpsLat: traceability.gpsLat ?? gpsLat,
      gpsLng: traceability.gpsLng ?? gpsLng,
      handoverReferenceNumber:
        traceability.handoverReferenceNumber || `LOT-${data.id.slice(0, 8)}`,
      status: traceability.status || status
    });
  }

  return data;
};

export const updateLotStatus = async (lotId, status) => {
  const { data, error } = await supabase
    .from("lots")
    .update({ status })
    .eq("id", lotId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getCollectorLots = async (collectorId) => {
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("collector_id", collectorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getOpenLots = async () => {
  const { data, error } = await supabase
    .from("lots")
    .select("*, collectors(name, phone)")
    .in("status", ["created", "matched"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const subscribeToLotUpdates = (collectorId, onUpdate) => {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`lots-${collectorId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "lots",
        filter: `collector_id=eq.${collectorId}`
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

export const createTraceabilityRecord = async ({
  lotId,
  photoUrls,
  weight,
  gpsLat,
  gpsLng,
  handoverReferenceNumber,
  status = "handover_initiated"
}) => {
  const { data, error } = await supabase
    .from("traceability")
    .insert({
      lot_id: lotId,
      photo_urls: photoUrls,
      weight,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      handover_reference_number: handoverReferenceNumber,
      status,
      recycler_confirmed: false
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
