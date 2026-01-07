import { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import {
  Button,
  IconButton,
  List,
  Modal,
  Portal,
  Searchbar,
} from "react-native-paper";

export default function Averias({
  averias = [], // 🔹 valor por defecto para evitar undefined
  onSelect,
  selectedValue,
  error = false,
}) {
  // Orden alfabético por label
  const sortedAverias = [...averias].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(
    Array.isArray(sortedAverias)
      ? sortedAverias.find((a) => a.value === selectedValue) || null
      : null
  );

  useEffect(() => {
    if (selectedValue && Array.isArray(sortedAverias)) {
      const item = sortedAverias.find((a) => a.value === selectedValue);
      if (item) setSelected(item);
    }
  }, [selectedValue, sortedAverias]);

  const filtered = Array.isArray(sortedAverias)
    ? sortedAverias.filter((a) =>
        a.label.toLowerCase().startsWith(search.toLowerCase())
      )
    : [];

  const handleSelect = (item) => {
    setSelected(item);
    if (onSelect) onSelect(item);
    setVisible(false);
    setSearch("");
  };

  const renderItem = ({ item }) => (
    <List.Item title={item.label} onPress={() => handleSelect(item)} />
  );

  const windowHeight = Dimensions.get("window").height;

  return (
    <View>
      <View style={styles.buttonContainer}>
        <Button
          textColor="#424242e5"
          labelStyle={{
            fontSize: selected ? 18 : 15,
            padding: 2,
            color: selected ? "#48b839ff" : "",
          }}
          buttonColor={error ? "#ff6b6b55" : "#eaeaea87"}
          onPress={() => setVisible(true)}
          style={{ borderWidth: 1, borderColor: "#afafafbc" }}
          icon={selected ? "check-circle" : ""}
        >
          {selected ? selected.label : "Seleccionar Avería"}
        </Button>
      </View>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { maxHeight: windowHeight * 0.55 },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar avería</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setVisible(false)}
            />
          </View>

          {/* Search */}
          <Searchbar
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
            style={{
              marginBottom: 15,
              height: 50,
              backgroundColor: "#dcd4d4f1",
              marginHorizontal: 10,
            }}
          />

          {/* Lista */}
          {filtered.length > 0 ? (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
            />
          ) : (
            <View style={styles.noResult}>
              <Text>No se encontraron resultados</Text>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 60,
    backgroundColor: "#ebe7e7ff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 10,
    width: 336,
  },
  noResult: {
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: 10,
  },
});
