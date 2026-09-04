import React, { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_LANGUAGE, DEFAULT_LOCATION } from "../utils/constants";
import { getCurrentUser } from "../services/authService";
import { t as translateHelper } from "../services/translationService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("kabadi_lang") || DEFAULT_LANGUAGE;
  });

  const [user, setUser] = useState(() => getCurrentUser());
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  
  // State for active scrap estimation flow
  const [activeItem, setActiveItem] = useState(null);
  const [activeWeight, setActiveWeight] = useState(1);
  const [selectedRecycler, setSelectedRecycler] = useState(null);

  const changeLanguage = (langId) => {
    setLanguageState(langId);
    localStorage.setItem("kabadi_lang", langId);
  };

  const t = (key) => {
    return translateHelper(key, language);
  };

  const updateUserSession = (userData) => {
    setUser(userData);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        user,
        setUser: updateUserSession,
        userLocation,
        setUserLocation,
        activeItem,
        setActiveItem,
        activeWeight,
        setActiveWeight,
        selectedRecycler,
        setSelectedRecycler
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
