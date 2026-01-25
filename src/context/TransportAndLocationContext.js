// src/context/AppStatusContext.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const AppStatusContext = createContext({
  lugar: "Detectando...",
  batea: null,
});

export const AppStatusProvider = ({ children }) => {
  const [lugar, setLugar] = useState("Detectando...");
  const [batea, setBatea] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const raw = await AsyncStorage.getItem("locacion_actual");
      if (!raw) return;

      try {
        if (raw) setLugar(raw);
      } catch (e) {
        console.warn("Estado inválido en storage", e);
      }
    }, 3000); // polling liviano

    return () => clearInterval(interval);
  }, [lugar]);

  return (
    <AppStatusContext.Provider value={{ lugar, batea, setLugar, setBatea }}>
      {children}
    </AppStatusContext.Provider>
  );
};

export const useAppStatus = () => useContext(AppStatusContext);
