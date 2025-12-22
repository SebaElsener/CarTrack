import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import ScanItem from "../components/ScanItem";
import { getScans } from "../database/Database";

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const { vin } = useLocalSearchParams();

  const listRef = useRef(null);
  const [activeCode, setActiveCode] = useState(null);
  const CARD_HEIGHT = 220;

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
    const index = data.findIndex((s) => s.code === activeCode);
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
    <View style={{ flex: 1, padding: 15 }}>
      {/* <Button title="Eliminar todo" onPress={() => clearScans()} /> */}

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ScanItem item={item} isActive={item.code === activeCode} />
        )}
        getItemLayout={(data, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
          index,
        })}
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
