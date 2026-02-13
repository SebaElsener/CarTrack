import { useAppStatus } from "@/src/context/TransportAndLocationContext";
import * as Location from "expo-location";
import { useEffect, useRef } from "react";
import { resolverLocacion } from "../gps/locationUtil";

export const useLocationStatus = () => {
  const { setLugarGPS, setLugarManual } = useAppStatus();

  const zonaActualRef = useRef(null);
  const salidaConfirmRef = useRef(0);

  useEffect(() => {
    let sub;

    const procesar = (coords) => {
      const nuevaZona = resolverLocacion(coords, zonaActualRef.current);

      // 🟢 Entrada inmediata
      if (nuevaZona && nuevaZona !== zonaActualRef.current) {
        zonaActualRef.current = nuevaZona;
        salidaConfirmRef.current = 0;

        setLugarManual(null);
        setLugarGPS(nuevaZona);
        return;
      }

      // 🔴 Posible salida
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
};
