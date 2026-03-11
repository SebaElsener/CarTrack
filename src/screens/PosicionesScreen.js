import { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";

import { useFocusEffect } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { saveScanPosition } from "../database/Database";

export default function Posicionamiento({ onScan }) {
  const { user } = useAuth();

  const [sector, setSector] = useState("");
  const [fila, setFila] = useState(1);

  const [ultimoVin, setUltimoVin] = useState("");
  const [contador, setContador] = useState(0);

  const [ultimos, setUltimos] = useState([]);

  const inputRef = useRef(null);
  const lastScanRef = useRef("");

  useFocusEffect(
    useCallback(() => {
      inputRef.current?.focus();
    }, []),
  );

  const focusScanner = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const procesarVIN = async (vinRaw) => {
    const vin = vinRaw.trim().toUpperCase();

    if (vin.length !== 17) {
      Alert.alert("VIN inválido");
      return;
    }

    // evitar doble scan inmediato
    if (vin === lastScanRef.current) {
      return;
    }

    lastScanRef.current = vin;

    await saveScanPosition(vin, sector, fila, user);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setUltimoVin(vin);

    setContador((c) => c + 1);

    setUltimos((prev) => {
      const list = [vin, ...prev];
      return list.slice(0, 8);
    });

    inputRef.current?.clear();
  };

  const cambiarFila = () => {
    setFila((f) => f + 1);
  };

  return (
    <View style={styles.container}>
      {/* input oculto para scanner */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        autoFocus
        blurOnSubmit={false}
        showSoftInputOnFocus={false}
        onSubmitEditing={(e) => procesarVIN(e.nativeEvent.text)}
      />

      {/* sector */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>Sector</Text>

        <TextInput
          value={sector}
          onChangeText={setSector}
          placeholder="Ingresar sector"
          placeholderTextColor="#dcdcdc"
          style={styles.input}
          onFocus={() => inputRef.current?.blur()}
          onBlur={focusScanner}
        />
      </View>

      {/* fila actual */}

      <View style={styles.filaBox}>
        <Text style={styles.filaLabel}>Fila actual</Text>

        <Text style={styles.filaNumero}>{fila}</Text>

        <Pressable style={styles.botonFila} onPress={cambiarFila}>
          <Text style={styles.botonTexto}>Cambio de fila</Text>
        </Pressable>
      </View>

      {/* último vin */}

      <View style={styles.scanBox}>
        <Text style={styles.scanTitle}>Último VIN escaneado</Text>

        <Text style={styles.scanVin}>{ultimoVin || "..."}</Text>
      </View>

      {/* contador */}

      <Text style={styles.contador}>Escaneados: {contador}</Text>

      {/* lista últimos scans */}

      <View style={styles.listaContainer}>
        <Text style={styles.listaTitle}>Últimos scans</Text>

        <FlatList
          data={ultimos}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <Text style={styles.listaItem}>{item}</Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#0f172a",
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },

  title: {
    fontSize: 19,
    color: "white",
    marginBottom: 20,
  },

  inputRow: {
    marginBottom: 20,
  },

  label: {
    color: "#94a3b8",
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 12,
    borderRadius: 8,
  },

  filaBox: {
    alignItems: "center",
  },

  filaLabel: {
    color: "#94a3b8",
    fontSize: 16,
  },

  filaNumero: {
    color: "#22c55e",
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 10,
  },

  botonFila: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  botonTexto: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  scanBox: {
    marginTop: 10,
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  scanTitle: {
    color: "#94a3b8",
  },

  scanVin: {
    color: "#22c55e",
    fontSize: 20,
    marginTop: 8,
    fontWeight: "600",
  },

  contador: {
    marginTop: 10,
    textAlign: "center",
    color: "white",
    fontSize: 18,
  },

  listaContainer: {
    marginTop: 10,
  },

  listaTitle: {
    color: "#94a3b8",
    marginBottom: 10,
  },

  listaItem: {
    color: "#e2e8f0",
    //paddingVertical: 4,
  },
});
