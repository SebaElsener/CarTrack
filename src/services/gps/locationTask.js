import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from "expo-task-manager";
import { resolverLocacion } from "../gps/locationUtil";

export const TASK_NAME = "BACKGROUND_LOCATION_TASK";

console.log("📍 locationTask cargado");

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) return;

  const location = data?.locations?.[0];
  if (!location) return;

  const coords = location.coords;
  if (coords.accuracy > 100) return;

  const zona = resolverLocacion(coords);
  const valorFinal = zona ?? "Fuera de zona";

  const actual = await AsyncStorage.getItem("lugar_actual");

  if (actual === valorFinal) return;

  await AsyncStorage.setItem("lugar_actual", valorFinal);

  console.log("📍 BG actualizado:", valorFinal);
});
