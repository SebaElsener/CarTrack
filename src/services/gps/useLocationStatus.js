import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { TASK_NAME } from "./locationTask";

export const useLocationStatus = () => {
  const [locacion, setLocacion] = useState("Detectando...");

  useEffect(() => {
    const init = async () => {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") return;

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
