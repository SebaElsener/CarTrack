// src/context/AppStatusContext.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const AppStatusContext = createContext({
  lugar: "Detectando...",
});

export const AppStatusProvider = ({ children }) => {
  const [lugar, setLugar] = useState("Detectando...");

  useEffect(() => {
    const interval = setInterval(async () => {
      const raw = await AsyncStorage.getItem("lugar_actual");
      console.log("ZONA LEIDA EN CONTEXT: ", raw);
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
    <AppStatusContext.Provider value={{ lugar, setLugar }}>
      {children}
    </AppStatusContext.Provider>
  );
};

export const useAppStatus = () => useContext(AppStatusContext);
