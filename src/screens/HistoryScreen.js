import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import ScanItem from "../components/ScanItem";
import { useScans } from "../context/ScanContext";
import { deleteScan, getScans } from "../database/Database";

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [activeVin, setActiveVin] = useState(null);
  const listRef = useRef(null);
  const debounceTimeout = useRef(null);
  const { refreshTotalScans, decrementTransportScan } = useScans();
  const [localPictsMap, setLocalPictsMap] = useState({});
  const pendingVinRef = useRef(null);
  const { vin } = useLocalSearchParams();

  // Carga inicial
  const loadData = async () => {
    const scans = await getScans();
    setData(scans);
    setFiltered(scans);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔄 Actualizar al ganar foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // ------------------- Mantener activeVin desde ScannerScreen -------------------
  useFocusEffect(
    useCallback(() => {
      if (vin) {
        pendingVinRef.current = vin;
      }
    }, [vin])
  );

  useEffect(() => {
    if (!pendingVinRef.current) return;
    if (filtered.length === 0) return;

    const index = filtered.findIndex((d) => d.vin === pendingVinRef.current);

    if (index === -1) return;

    setActiveVin(pendingVinRef.current);
    pendingVinRef.current = null;
  }, [filtered]);

  // ------------------- Filtrado con debounce -------------------
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (search === "") {
        setFiltered(data);
        // ❌ No tocar activeVin aquí, se mantiene el que vino de ScannerScreen
      } else {
        const result = data.filter((d) =>
          d.vin.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
        setActiveVin(result.length > 0 ? result[0].vin : null); // solo si hay búsqueda
      }
    }, 200);

    return () => clearTimeout(debounceTimeout.current);
  }, [search, data]);

  //////////////// fotos /////////////////
  /////////////// fotos //////////////////////////////// fotos /////////////////
  useEffect(() => {
    let mounted = true;
    const loadAllPicts = async () => {
      if (!Array.isArray(data)) {
        return;
      }
      const map = {};
      for (const scan of data) {
        if (scan.fotos?.length > 0) {
          try {
            const path = scan.fotos[0]; // carpeta del scan
            const archivos = await FileSystem.readDirectoryAsync(path);
            map[scan.vin] = archivos
              .filter((a) => a.endsWith(".jpg"))
              .map((a) => path + a);
          } catch (e) {
            console.log("Error cargando fotos de VIN", scan.vin, e);
            map[scan.vin] = [];
          }
        } else {
          map[scan.vin] = [];
        }
      }
      if (mounted) setLocalPictsMap(map);
    };

    loadAllPicts();

    return () => {
      mounted = false;
    };
  }, [data]);

  /////////////// fotos /////////////////
  /////////////// fotos /////////////////
  /////////////// fotos /////////////////
  /////////////// fotos /////////////////

  // Delete scan
  const handleDeleteScan = async (vin) => {
    await deleteScan(vin);
    const newData = data.filter((d) => d.vin !== vin);
    setData(newData);
    setFiltered(newData);
    if (activeVin === vin) setActiveVin(null);
    refreshTotalScans();
    decrementTransportScan();
  };

  // Scroll seguro al item activo
  useEffect(() => {
    if (!activeVin) return;
    const index = filtered.findIndex((d) => d.vin === activeVin);
    if (index === -1) return;

    setTimeout(() => {
      if (listRef.current && filtered.length > 0 && index < filtered.length) {
        listRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }, 50);
  }, [activeVin, filtered]);

  // Resaltado de caracteres
  const renderVin = (vin) => {
    if (!search) return <Text style={styles.vin}>{vin}</Text>;
    const regex = new RegExp(`(${search})`, "i");
    const parts = vin.split(regex);
    return (
      <Text style={styles.vin}>
        {parts.map((part, i) => (
          <Text key={i} style={regex.test(part) ? styles.highlight : {}}>
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar VIN..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <FlatList
        ref={listRef}
        data={filtered}
        extraData={filtered} // 🔹 fuerza re-render al cambiar daños
        keyExtractor={(item) => item.vin}
        renderItem={({ item }) => {
          if (!item) return null; // 🔹 evita crash si item es undefined
          return (
            <ScanItem
              key={item.vin + (item.damages?.length || 0)} // forzar remount si cambia cantidad de daños
              item={item}
              localPicts={localPictsMap[item.vin] || []}
              isActive={item.vin === activeVin}
              onDelete={handleDeleteScan}
              renderVin={renderVin}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  input: {
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#e8e5e57a",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    width: "95%",
    alignSelf: "center",
  },
  vin: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#4d4d4d",
    textAlign: "center",
  },
  highlight: {
    backgroundColor: "yellow",
  },
});
