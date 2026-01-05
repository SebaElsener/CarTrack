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

export default function Averias({ averias, onSelect, selectedValue }) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(
    averias.find((a) => a.value === selectedValue) || null
  );

  useEffect(() => {
    if (selectedValue) {
      const item = averias.find((a) => a.value === selectedValue);
      if (item) setSelected(item);
    }
  }, [selectedValue, averias]);

  const filtered = averias.filter((a) =>
    a.label.toLowerCase().includes(search.toLowerCase())
  );

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
          labelStyle={{ fontSize: 15, textAlign: "left", padding: 2 }}
          buttonColor="#eaeaea87"
          mode="outlined"
          onPress={() => setVisible(true)}
          style={{ borderWidth: 1, borderColor: "#afafafbc" }}
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
            { maxHeight: windowHeight * 0.8 },
          ]}
        >
          {/* Botón cerrar X */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Avería</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setVisible(false)}
            />
          </View>

          {/* Buscador */}
          <Searchbar
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
            style={{ marginBottom: 8 }}
          />

          {/* Lista o mensaje */}
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
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 10,
  },
  noResult: {
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
  },
  buttonContainer: {
    marginBottom: 10,
  },
});
