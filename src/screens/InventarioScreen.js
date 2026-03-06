import { StyleSheet, Text, View } from "react-native";

export default function Inventario() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Inventario de Vehículos</Text>
      <Text style={styles.label}>EN DESARROLLO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a",
  },

  title: {
    fontSize: 22,
    color: "white",
    marginBottom: 20,
  },

  label: {
    color: "#94a3b8",
    marginBottom: 5,
  },
});
