import { StyleSheet, Text, View } from "react-native";
import { useLocationStatus } from "../services/gps/useLocationStatus";

export default function LocationStatusBar() {
  const locacion = useLocationStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>PLAYA</Text>
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
    fontWeight: "500",
  },
});
