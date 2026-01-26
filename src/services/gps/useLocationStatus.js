import { useAppStatus } from "@/src/context/TransportAndLocationContext";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { getLugar } from "../gps/locationStore";
import { resolverLocacion } from "../gps/locationUtil";

export const useLocationStatus = () => {
  const [locacion, setLocacion] = useState("Detectando...");
  const { setLugar } = useAppStatus();

  useEffect(() => {
    const cargar = async () => {
      const guardado = await getLugar();
      if (guardado) {
        setLocacion(guardado);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    let sub;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // 🔥 posición inicial (YA comprobamos que funciona)
      const pos = await Location.getCurrentPositionAsync({});
      console.log("POSICION INICIAL: ", pos);
      setLocacion(resolverLocacion(pos.coords) ?? "Fuera de zona");

      // 🔥 tracking en vivo
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 15,
        },
        (location) => {
          const nombre = resolverLocacion(location.coords) ?? "Fuera de zona";
          console.log("NOMBRE NUEVA LOCACION: ", nombre);
          setLocacion(nombre);
          setLugar(nombre);
        },
      );
    };

    start();

    return () => {
      sub?.remove();
    };
  }, []);

  return locacion;
};
