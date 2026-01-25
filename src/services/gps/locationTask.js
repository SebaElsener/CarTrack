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

  console.log("Accuracy:", coords.accuracy);
  console.log("Coords:", coords.latitude, coords.longitude);
  console.log("Nueva:", nueva);
  console.log("Actual:", actual);

  const valorFinal = nueva ?? "Fuera de zona";

  if (valorFinal === actual) return;

  // Confirmación simple (anti rebote)
  const pendiente = await AsyncStorage.getItem("locacion_pendiente");

  if (pendiente === valorFinal) {
    await setActual(valorFinal);
    await AsyncStorage.setItem("locacion_actual", valorFinal);
    await AsyncStorage.removeItem("locacion_pendiente");
  } else {
    await AsyncStorage.setItem("locacion_pendiente", valorFinal);
  }
});
