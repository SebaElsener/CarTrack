import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from "expo-task-manager";
import { resolverLocacion } from "../gps/locationUtil";

export const TASK_NAME = "BACKGROUND_LOCATION_TASK";

const getActual = async () => await AsyncStorage.getItem("locacion_confirmada");

const setActual = async (nombre) =>
  await AsyncStorage.setItem("locacion_confirmada", nombre);

console.log("📍 locationTask cargado");

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  console.log("📍 TASK EJECUTADO");

  if (error) return;

  const location = data?.locations?.[0];
  if (!location) return;

  const coords = location.coords;
  if (coords.accuracy > 100) return;

  const nueva = resolverLocacion(coords);
  const actual = await getActual();

  console.log("Coords:", coords);
  console.log("Accuracy:", coords.accuracy);
  console.log("Nueva locación:", nueva);

  if (!nueva || nueva === actual) return;

  // Confirmación simple (anti rebote)
  const pendiente = await AsyncStorage.getItem("locacion_pendiente");

  if (pendiente === nueva) {
    await setActual(nueva);
    await AsyncStorage.setItem("locacion_actual", nueva);
    await AsyncStorage.removeItem("locacion_pendiente");
  } else {
    await AsyncStorage.setItem("locacion_pendiente", nueva);
  }
});
