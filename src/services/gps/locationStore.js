import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lugar_actual";

export const saveLugar = async (lugar) => {
  try {
    await AsyncStorage.setItem(KEY, lugar ?? "");
  } catch (e) {
    console.log("❌ Error guardando lugar", e);
  }
};

export const getLugar = async () => {
  try {
    const val = await AsyncStorage.getItem(KEY);
    return val || null;
  } catch {
    return null;
  }
};
