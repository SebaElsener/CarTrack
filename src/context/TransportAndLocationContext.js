// src/context/TransportAndLocationContext.js

import * as Location from "expo-location";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { resolverLocacion } from "../services/gps/locationUtil";

const AppStatusContext = createContext({});

export const AppStatusProvider = ({ children }) => {
  const [lugarGPS, setLugarGPS] = useState(null);
  const [lugarManual, setLugarManual] = useState(null);
  const [destino, setDestino] = useState(null);

  const zonaActualRef = useRef(null);
  const salidaConfirmRef = useRef(0);

  // 🔥 PRIORIDAD
  const lugar = lugarManual ?? lugarGPS ?? null;

  useEffect(() => {
    let sub;

    const procesar = (coords) => {
      const nuevaZona = resolverLocacion(coords, zonaActualRef.current);

      // 🟢 ENTRA EN ZONA
      if (nuevaZona && nuevaZona !== zonaActualRef.current) {
        zonaActualRef.current = nuevaZona;
        salidaConfirmRef.current = 0;

        setLugarManual(null); // liberar override
        setLugarGPS(nuevaZona);
        return;
      }

      // 🔴 POSIBLE SALIDA
      if (!nuevaZona && zonaActualRef.current) {
        salidaConfirmRef.current += 1;

        if (salidaConfirmRef.current >= 2) {
          zonaActualRef.current = null;
          salidaConfirmRef.current = 0;
          setLugarGPS(null);
        }

        return;
      }

      salidaConfirmRef.current = 0;
    };

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({});
      procesar(pos.coords);

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 15,
        },
        (location) => {
          procesar(location.coords);
        },
      );
    };

    start();

    return () => {
      sub?.remove();
    };
  }, []);

  return (
    <AppStatusContext.Provider
      value={{
        lugar,
        lugarGPS,
        lugarManual,
        setLugarManual,
        destino,
        setDestino,
      }}
    >
      {children}
    </AppStatusContext.Provider>
  );
};

export const useAppStatus = () => useContext(AppStatusContext);
