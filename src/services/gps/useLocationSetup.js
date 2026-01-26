// useLocationSetup.js
import * as Location from "expo-location";
import { useEffect } from "react";
import { TASK_NAME } from "./locationTask";

export function useLocationSetup() {
  useEffect(() => {
    const init = async () => {
      const poss = await Location.getCurrentPositionAsync();
      console.log("POSICION: ", poss);

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
}
