import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import ScanItem from "../components/ScanItem";
import { deleteScan, getScans } from "../database/Database";

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [activeVin, setActiveVin] = useState(null);
  const listRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Carga inicial
  const loadData = async () => {
    const scans = await getScans();
    setData(scans);
    setFiltered(scans);
  };

  // 🔄 Actualizar al ganar foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado con debounce
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (search === "") {
        setFiltered(data);
        setActiveVin(null);
      } else {
        const result = data.filter((d) =>
          d.vin.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
        setActiveVin(result.length > 0 ? result[0].vin : null);
      }
    }, 200);

    return () => clearTimeout(debounceTimeout.current);
  }, [search, data]);

  // Delete scan
  const handleDeleteScan = async (vin) => {
    await deleteScan(vin);
    const newData = data.filter((d) => d.vin !== vin);
    setData(newData);
    setFiltered(newData);
    if (activeVin === vin) setActiveVin(null);
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
        keyExtractor={(item) => item.vin}
        renderItem={({ item }) => (
          <ScanItem
            item={item}
            isActive={item.vin === activeVin}
            onDelete={handleDeleteScan}
            renderVin={renderVin} // pasar render function
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  input: {
    borderWidth: 2,
    borderColor: "#ccc",
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
