import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, getCurrentBuyer } from "../services/authService";

export const ProtectedRoute = ({ children, role = "collector" }) => {
  const location = useLocation();
  const user = role === "buyer" ? getCurrentBuyer() : getCurrentUser();

  if (!user?.isLoggedIn) {
    const redirect = role === "buyer" ? "/buyer/login" : "/login";
    return <Navigate to={redirect} state={{ from: location.pathname }} replace />;
  }

  return children;
};
