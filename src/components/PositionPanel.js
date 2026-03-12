import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";
import { findScanByLast6, saveScanPosition } from "../database/Database";
import { exportToExcel } from "./exportExcel";

export default function PositionPanel({ vin }) {
  const listRef = useRef(null);
  const [vinSearch, setVinSearch] = useState("");
  const [mostrarResultado, setMostrarResultado] = useState(false);

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

  const buscarVin = async (text) => {
    if (text.length < 6) return;

    const registro = await findScanByLast6(text);

    if (registro) {
      const fecha = new Date(registro.position_date).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      setVinSearch(
        `${registro.vin} | ${registro.sector}-${registro.fila} | ${fecha}`,
      );

      setMostrarResultado(true);
      Keyboard.dismiss();
    } else {
      setVinSearch("Sin datos para el VIN consultado");
      setMostrarResultado(true);
      Keyboard.dismiss();
    }
  };

  const filaAdelante = () => {
    setFila((f) => f + 1);
  };

  const filaAtras = () => {
    setFila((f) => (f > 1 ? f - 1 : 1));
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.exportButton} onPress={exportToExcel}>
        <Text style={styles.buttonText}>Exportar Excel</Text>
      </Pressable>
      <TextInput
        value={vinSearch}
        onChangeText={(text) => {
          //   const soloNumeros = text.replace(/[^0-9]/g, "");
          setVinSearch(text);
          setMostrarResultado(false);
          buscarVin(text);
        }}
        onFocus={() => {
          setVinSearch("");
          setMostrarResultado(false);
        }}
        placeholder="Buscar VIN (últimos 6)"
        placeholderTextColor="white"
        maxLength={mostrarResultado ? undefined : 6}
        style={styles.searchInput}
      />
      <View style={styles.sectorWrap}>
        <TextInput
          value={sector}
          onChangeText={setSector}
          placeholder="Sector"
          //color="white"
          placeholderTextColor="white"
          style={styles.input}
        />

        <Text style={styles.fila}>Fila: {fila}</Text>
      </View>
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
  searchInput: {
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 6,
    marginBottom: 10,
    padding: 8,
  },
  input: {
    backgroundColor: "#24a03d",
    color: "#fff",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    width: 150,
  },
  sectorWrap: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fila: {
    color: "#22c55e",
    fontSize: 20,
    flex: 1,
    textAlign: "center",
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
  exportButton: {
    position: "absolute",
    backgroundColor: "#16a34a",
    padding: 8,
    borderRadius: 6,
    //marginTop: 10,
    top: 165,
    right: 10,
    alignItems: "center",
  },
});
