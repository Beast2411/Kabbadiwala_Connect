import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { hashPin, verifyPinHash, generatePin } from "../utils/helpers";

const SESSION_KEY = "kabadi_collector_session";
const TEMP_PHONE_KEY = "kabadi_temp_phone";
const DEMO_PIN_KEY = "kabadi_demo_pin";
const PIN_TTL_MS = 10 * 60 * 1000;

const toSessionUser = (collector) => ({
  id: collector.id,
  name: collector.name,
  phone: collector.phone,
  preferredLanguage: collector.preferred_language || "en",
  locationLat: collector.location_lat,
  locationLng: collector.location_lng,
  isLoggedIn: true,
  role: "collector",
  loginTimestamp: new Date().toISOString()
});

export const saveSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TEMP_PHONE_KEY);
  localStorage.removeItem(DEMO_PIN_KEY);
};

export const getCurrentUser = () => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      clearSession();
    }
  }
  return { isLoggedIn: false, role: null };
};

export const registerCollector = async ({
  name,
  phone,
  preferredLanguage = "en",
  locationLat = null,
  locationLng = null
}) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Check your .env file.");
  }

  const pin = generatePin();
  const pinHash = await hashPin(pin);
  const pinExpiresAt = new Date(Date.now() + PIN_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("collectors")
    .upsert(
      {
        phone,
        name: name.trim(),
        preferred_language: preferredLanguage,
        location_lat: locationLat,
        location_lng: locationLng,
        pin_hash: pinHash,
        pin_expires_at: pinExpiresAt
      },
      { onConflict: "phone" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  localStorage.setItem(TEMP_PHONE_KEY, phone);
  sessionStorage.setItem(DEMO_PIN_KEY, pin);

  return {
    success: true,
    collectorId: data.id,
    message: `Verification code sent for +91 ${phone}`,
    demoPin: pin
  };
};

export const sendOTP = async (phone) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Check your .env file.");
  }

  const { data: existing, error: fetchError } = await supabase
    .from("collectors")
    .select("id, phone, name")
    .eq("phone", phone)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing) {
    throw new Error("No account found. Please sign up first.");
  }

  const pin = generatePin();
  const pinHash = await hashPin(pin);
  const pinExpiresAt = new Date(Date.now() + PIN_TTL_MS).toISOString();

  const { error } = await supabase
    .from("collectors")
    .update({ pin_hash: pinHash, pin_expires_at: pinExpiresAt })
    .eq("phone", phone);

  if (error) throw new Error(error.message);

  localStorage.setItem(TEMP_PHONE_KEY, phone);
  sessionStorage.setItem(DEMO_PIN_KEY, pin);

  return {
    success: true,
    message: `OTP sent to +91 ${phone}`,
    demoPin: pin
  };
};

export const verifyOTP = async (code, phoneOverride = null) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Check your .env file.");
  }

  const phone = phoneOverride || localStorage.getItem(TEMP_PHONE_KEY);
  if (!phone) throw new Error("Session expired. Please log in again.");
  if (!code || code.length !== 6) {
    throw new Error("Please enter a valid 6-digit code");
  }

  const { data: collector, error } = await supabase
    .from("collectors")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !collector) throw new Error("Account not found. Please sign up.");

  if (collector.pin_expires_at && new Date(collector.pin_expires_at) < new Date()) {
    throw new Error("Code expired. Please request a new one.");
  }

  const valid = await verifyPinHash(code, collector.pin_hash);
  if (!valid) throw new Error("Invalid verification code");

  await supabase
    .from("collectors")
    .update({ pin_hash: null, pin_expires_at: null })
    .eq("id", collector.id);

  const userSession = toSessionUser(collector);
  saveSession(userSession);
  sessionStorage.removeItem(DEMO_PIN_KEY);

  return { success: true, user: userSession };
};

export const resendOTP = async (phone) => sendOTP(phone);

export const logoutUser = async () => {
  clearSession();
  await supabase.auth.signOut();
  return { success: true };
};

export const updateCollectorProfile = async (collectorId, updates) => {
  const payload = {};
  if (updates.name) payload.name = updates.name;
  if (updates.preferredLanguage) payload.preferred_language = updates.preferredLanguage;
  if (updates.locationLat != null) payload.location_lat = updates.locationLat;
  if (updates.locationLng != null) payload.location_lng = updates.locationLng;

  const { data, error } = await supabase
    .from("collectors")
    .update(payload)
    .eq("id", collectorId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const userSession = toSessionUser(data);
  saveSession(userSession);
  return userSession;
};

export const getDemoPin = () => sessionStorage.getItem(DEMO_PIN_KEY);

// --- Recycler / Buyer auth (Supabase Auth + recyclers table) ---

export const registerBuyer = async ({
  name,
  email,
  password,
  contact,
  registrationId,
  locationLat,
  locationLng,
  materialsAccepted,
  offeredRates,
  pickupAvailable
}) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Check your .env file.");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: "recycler", name }
    }
  });

  if (authError) throw new Error(authError.message);

  const { data: recycler, error: dbError } = await supabase
    .from("recyclers")
    .insert({
      name,
      contact: contact || email,
      registration_id: registrationId || null,
      location_lat: locationLat,
      location_lng: locationLng,
      materials_accepted: materialsAccepted,
      offered_rates: offeredRates || {},
      pickup_available: pickupAvailable ?? false,
      authorized: false
    })
    .select()
    .single();

  if (dbError) throw new Error(dbError.message);

  localStorage.setItem(
    "kabadi_buyer_session",
    JSON.stringify({
      id: recycler.id,
      authUserId: authData.user?.id,
      name: recycler.name,
      email,
      role: "buyer",
      isLoggedIn: true
    })
  );

  return { success: true, recycler, user: authData.user };
};

export const loginBuyer = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const { data: recycler } = await supabase
    .from("recyclers")
    .select("*")
    .eq("contact", email)
    .maybeSingle();

  const session = {
    id: recycler?.id,
    authUserId: data.user.id,
    name: recycler?.name || data.user.user_metadata?.name || "Buyer",
    email,
    role: "buyer",
    isLoggedIn: true,
    recycler
  };

  localStorage.setItem("kabadi_buyer_session", JSON.stringify(session));
  return { success: true, session };
};

export const getCurrentBuyer = () => {
  const stored = localStorage.getItem("kabadi_buyer_session");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem("kabadi_buyer_session");
    }
  }
  return { isLoggedIn: false, role: null };
};

export const logoutBuyer = async () => {
  localStorage.removeItem("kabadi_buyer_session");
  await supabase.auth.signOut();
  return { success: true };
};
