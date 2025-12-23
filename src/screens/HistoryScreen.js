import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import ScanItem from "../components/ScanItem";
import { deleteScan, getScans } from "../database/Database";

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const { vin } = useLocalSearchParams();

  const listRef = useRef(null);
  const [activeCode, setActiveCode] = useState(null);

  const handleDeleteScan = async (id) => {
    await deleteScan(id); // borra en SQLite
    setData((prev) => prev.filter((item) => item.id !== id)); // borra la card
  };

  const loadData = async () => {
    setData(await getScans());
  };

  useEffect(() => {
    setActiveCode(null);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setActiveCode(vin);
  }, [vin]);

  useEffect(() => {
    if (!activeCode || data.length === 0) return;
    const index = data.findIndex((s) => s.vin === activeCode);
    if (index === -1) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    });
  }, [activeCode, data]);

  return (
    <View style={{ flex: 1, padding: 4 }}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.scan_id.toString()}
        renderItem={({ item }) => (
          <ScanItem
            item={item}
            isActive={item.vin === activeCode}
            onDelete={handleDeleteScan}
          />
        )}
        onScrollToIndexFailed={() => {
          // fallback (por si aún no está medido)
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: 0,
              animated: true,
            });
          }, 300);
        }}
      />
    </View>
  );
}
