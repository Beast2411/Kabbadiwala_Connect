import React, { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_LANGUAGE, DEFAULT_LOCATION } from "../utils/constants";
import { getCurrentUser } from "../services/authService";
import { getCurrentLocation } from "../services/locationService";
import { subscribeToLotUpdates } from "../services/lotService";
import { t as translateHelper } from "../services/translationService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("kabadi_lang") || DEFAULT_LANGUAGE;
  });

  const [user, setUser] = useState(() => getCurrentUser());
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [activeItem, setActiveItem] = useState(null);
  const [activeWeight, setActiveWeight] = useState(1);
  const [selectedRecycler, setSelectedRecycler] = useState(null);
  const [activeLot, setActiveLot] = useState(null);

  useEffect(() => {
    if (user?.preferredLanguage) {
      setLanguageState(user.preferredLanguage);
      localStorage.setItem("kabadi_lang", user.preferredLanguage);
    }
    if (user?.locationLat && user?.locationLng) {
      setUserLocation({
        lat: user.locationLat,
        lng: user.locationLng,
        address: "Saved location"
      });
    } else {
      getCurrentLocation().then(setUserLocation);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !user.isLoggedIn) return undefined;
    return subscribeToLotUpdates(user.id, (updatedLot) => {
      setActiveLot(updatedLot);
    });
  }, [user?.id, user?.isLoggedIn]);

  const changeLanguage = (langId) => {
    setLanguageState(langId);
    localStorage.setItem("kabadi_lang", langId);
  };

  const t = (key) => translateHelper(key, language);

  const updateUserSession = (userData) => {
    setUser(userData);
    if (userData?.preferredLanguage) {
      changeLanguage(userData.preferredLanguage);
    }
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
        setSelectedRecycler,
        activeLot,
        setActiveLot
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
