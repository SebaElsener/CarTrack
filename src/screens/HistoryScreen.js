import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import ScanItem from "../components/ScanItem";
import { deleteScan, getScans } from "../database/Database";

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [activeVin, setActiveVin] = useState(null);

  const listRef = useRef(null);

  const ITEM_HEIGHT = 180; // ajusta según la altura de tu ScanItem

  // Cargar datos iniciales
  const loadData = async () => {
    const scans = await getScans();
    setData(scans);
    setFiltered(scans);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado con highlight
  useEffect(() => {
    if (!search) {
      setFiltered(data);
      setActiveVin(null);
    } else {
      const matches = data.filter((d) =>
        d.vin.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(matches);
      if (matches.length > 0) setActiveVin(matches[0].vin);
      else setActiveVin(null);
    }
  }, [search, data]);

  // Scroll automático al primer match
  useEffect(() => {
    if (!activeVin || filtered.length === 0) return;

    const index = filtered.findIndex((d) => d.vin === activeVin);
    if (index === -1) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    });
  }, [activeVin, filtered]);

  // Eliminar scan
  const handleDeleteScan = async (vin) => {
    await deleteScan(vin);
    const newData = data.filter((d) => d.vin !== vin);
    setData(newData);
    setFiltered(newData);
  };

  // Highlight del texto coincidente
  const renderVin = (vin) => {
    if (!search) return <Text style={styles.vinText}>{vin}</Text>;

    const regex = new RegExp(`(${search})`, "i");
    const parts = vin.split(regex);

    return (
      <Text style={styles.vinText}>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <Text key={i} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
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
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => (
          <ScanItem
            item={item}
            isActive={item.vin === activeVin}
            onDelete={handleDeleteScan}
            renderVin={renderVin} // <-- pasamos la función highlight
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f1f1f17a",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    width: "95%",
    alignSelf: "center",
  },
  vinText: {
    fontWeight: "bold",
    fontSize: 21,
    textAlign: "center",
    color: "#171717d3",
  },
  highlight: { backgroundColor: "yellow" },
});
