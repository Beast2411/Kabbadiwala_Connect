// Mock Auth Service for OTP flow (Placeholder for Firebase Auth)
import { simulateDelay } from "../utils/helpers";
import { mockUser } from "../data/mockData";

export const sendOTP = async (phone) => {
  await simulateDelay(800);
  if (!phone || phone.length < 10) {
    throw new Error("Invalid mobile phone number");
  }
  // Store temp phone in localStorage for session state
  localStorage.setItem("kabadi_temp_phone", phone);
  return {
    success: true,
    message: "OTP sent successfully to +91 " + phone,
    confirmationId: "mock_confirm_" + Date.now()
  };
};

export const verifyOTP = async (code) => {
  await simulateDelay(900);
  if (!code || code.length !== 6) {
    throw new Error("Please enter a valid 6-digit OTP code");
  }
  // For mock prototype, accept '123456' or any 6-digit code
  const phone = localStorage.getItem("kabadi_temp_phone") || mockUser.phone;
  const userSession = {
    ...mockUser,
    phone,
    isLoggedIn: true,
    loginTimestamp: new Date().toISOString()
  };
  localStorage.setItem("kabadi_user", JSON.stringify(userSession));
  return {
    success: true,
    user: userSession
  };
};

export const resendOTP = async (phone) => {
  await simulateDelay(600);
  return {
    success: true,
    message: "New OTP code sent to +91 " + phone
  };
};

export const logoutUser = async () => {
  await simulateDelay(400);
  localStorage.removeItem("kabadi_user");
  localStorage.removeItem("kabadi_temp_phone");
  return { success: true };
};

export const getCurrentUser = () => {
  const stored = localStorage.getItem("kabadi_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse user session", e);
    }
  }
  return mockUser;
};
