import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";
import { useAuth } from "../context/AuthContext";
import { saveScanPosition } from "../database/Database";

export default function PositionPanel({ vin }) {
  const { user } = useAuth();

  const [sector, setSector] = useState("");
  const [fila, setFila] = useState(1);

  const [ultimoVin, setUltimoVin] = useState("");
  const [contador, setContador] = useState(0);

  const [ultimos, setUltimos] = useState([]);

  const lastScanRef = useRef(null);

  useEffect(() => {
    if (!vin) return;

    if (vin === lastScanRef.current) return;

    lastScanRef.current = vin;

    procesarVIN(vin);
  }, [vin]);

  const procesarVIN = async (vin) => {
    await saveScanPosition(vin, sector, fila, user);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setUltimoVin(vin);

    setContador((c) => c + 1);

    setUltimos((prev) => {
      const list = [vin, ...prev];

      return list.slice(0, 8);
    });
  };

  const cambiarFila = () => {
    setFila((f) => f + 1);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={sector}
        onChangeText={setSector}
        placeholder="Sector"
        style={styles.input}
      />

      <Text style={styles.fila}>Fila: {fila}</Text>

      <Pressable style={styles.button} onPress={cambiarFila}>
        <Text>Cambiar fila</Text>
      </Pressable>

      <Text style={styles.contador}>Escaneados: {contador}</Text>

      <FlatList
        data={ultimos}
        keyExtractor={(item, i) => item + i}
        renderItem={({ item }) => <Text style={styles.item}>{item}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //position: "absolute",
    // top: 70,
    // left: 10,
    backgroundColor: "#e8e9ec",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    //width: 180,
  },

  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },

  fila: {
    color: "#22c55e",
    fontSize: 20,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },

  contador: {
    color: "#151515f0",
    marginTop: 10,
    marginBottom: 10,
  },

  item: {
    color: "#151515f0",
  },
});
