import { StyleSheet, Text, View } from "react-native";
import { useLocationStatus } from "../services/gps/useLocationStatus";

export default function LocationStatusBar() {
  const locacion = useLocationStatus();
  const backgroundColor =
    locacion === "Detectando..."
      ? "#444444a0"
      : locacion === "Fuera de zona"
        ? "#b30e2c9e" // rojo
        : "#24882b61"; // verde
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>LUGAR</Text>
      <Text style={styles.text}>{locacion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: "transparent",
    justifyContent: "center",
    //paddingHorizontal: 12,
    //width: "10%",
    flex: 1,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
