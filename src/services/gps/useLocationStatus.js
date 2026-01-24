import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { resolverLocacion } from "../gps/locationUtil";
import { TASK_NAME } from "./locationTask";

export const useLocationStatus = () => {
  const [locacion, setLocacion] = useState("Detectando...");

  useEffect(() => {
    const init = async () => {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") return;
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const nombre = resolverLocacion(location.coords);

      if (nombre) {
        await AsyncStorage.setItem("locacion_actual", nombre);
      }

      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== "granted") return;

      const running = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);

      if (!running) {
        await Location.startLocationUpdatesAsync(TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 50,
          timeInterval: 10 * 60 * 1000,
          pausesUpdatesAutomatically: true,
          foregroundService: {
            notificationTitle: "Ubicación activa",
            notificationBody: "Detección automática de locación",
          },
        });
      }
    };

    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const valor = await AsyncStorage.getItem("locacion_actual");
      if (valor) setLocacion(valor);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return locacion;
};
