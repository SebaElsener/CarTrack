import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { resolverLocacion } from "../gps/locationUtil";

export const useLocationStatus = () => {
  const [locacion, setLocacion] = useState("Detectando...");

  useEffect(() => {
    let sub;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // 🔥 posición inicial (YA comprobamos que funciona)
      const pos = await Location.getCurrentPositionAsync({});
      setLocacion(resolverLocacion(pos.coords) ?? "Fuera de zona");

      // 🔥 tracking en vivo
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
        },
        (location) => {
          const nombre = resolverLocacion(location.coords) ?? "Fuera de zona";
          setLocacion(nombre);
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

// import * as Location from "expo-location";
// import { useEffect, useState } from "react";
// import { resolverLocacion } from "../gps/locationUtil";

// export const useLocationStatus = () => {
//   const [locacion, setLocacion] = useState("Detectando...");

//   useEffect(() => {
//     let sub = null;

//     const start = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setLocacion("Permiso denegado");
//         return;
//       }

//       const enabled = await Location.hasServicesEnabledAsync();
//       if (!enabled) {
//         setLocacion("GPS apagado");
//         return;
//       }

//       try {
//         // 1️⃣ ubicación inicial
//         const first = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Balanced,
//         });

//         setLocacion(resolverLocacion(first.coords) ?? "Fuera de zona");

//         // 2️⃣ seguimiento en vivo
//         sub = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.Balanced,
//             distanceInterval: 10,
//           },
//           (location) => {
//             const nombre = resolverLocacion(location.coords) ?? "Fuera de zona";
//             setLocacion(nombre);
//           },
//         );
//       } catch (e) {
//         console.log("📍 Location error:", e);
//         setLocacion("Ubicación no disponible");
//       }
//     };

//     start();

//     return () => {
//       sub?.remove();
//     };
//   }, []);

//   return locacion;
// };
