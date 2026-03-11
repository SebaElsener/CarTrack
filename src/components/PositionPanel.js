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
import { saveScanPosition } from "../database/Database";

export default function PositionPanel({ vin }) {
  const listRef = useRef(null);

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
    await saveScanPosition(vin, sector, fila);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setUltimoVin(vin);

    setContador((c) => c + 1);

    const registro = {
      vin,
      sector,
      fila,
    };

    setUltimos((prev) => {
      const nuevaLista = [registro, ...prev];

      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 50);

      return nuevaLista;
    });
    // setUltimos((prev) => {
    //   const list = [registro, ...prev];
    //   return list.slice(0, 8);
    // });
  };

  const filaAdelante = () => {
    setFila((f) => f + 1);
  };

  const filaAtras = () => {
    setFila((f) => (f > 1 ? f - 1 : 1));
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={sector}
        onChangeText={setSector}
        placeholder="Sector"
        //color="white"
        placeholderTextColor="white"
        style={styles.input}
      />

      <Text style={styles.fila}>Fila: {fila}</Text>

      <View style={styles.filaButtons}>
        <Pressable style={styles.buttonBack} onPress={filaAtras}>
          <Text style={styles.buttonText}>Fila atrás</Text>
        </Pressable>

        <Pressable style={styles.buttonNext} onPress={filaAdelante}>
          <Text style={styles.buttonText}>Fila adelante</Text>
        </Pressable>
      </View>

      <Text style={styles.contador}>Escaneados: {contador}</Text>

      <View style={styles.lista}>
        <FlatList
          data={ultimos}
          ref={listRef}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, i) => item.vin + i}
          renderItem={({ item }) => (
            <Text style={styles.item}>
              {item.vin} | {item.sector} - {item.fila}
            </Text>
          )}
        />
      </View>
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
  filaButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  buttonBack: {
    backgroundColor: "#64748b",
    padding: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },

  buttonNext: {
    backgroundColor: "#2563eb",
    padding: 6,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  lista: {
    maxHeight: 65, // aprox 4 filas
  },
});
