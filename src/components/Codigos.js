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

export default function Codigos({
  codigos,
  onSelect,
  selectedValue,
  error = false,
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(
    codigos.find((a) => a.value === selectedValue) || null
  );

  useEffect(() => {
    if (selectedValue) {
      const item = codigos.find((a) => a.value === selectedValue);
      if (item) setSelected(item);
    }
  }, [selectedValue, codigos]);

  const filtered = codigos.filter((a) =>
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
          buttonColor={error ? "#ff6b6b55" : "#eaeaea87"} // 🔹 fondo rojo si error          mode="outlined"
          mode="outlined"
          onPress={() => setVisible(true)}
          style={{ borderWidth: 1, borderColor: "#afafafbc" }}
        >
          {selected ? selected.label : "Seleccionar Código"}
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
          {/* Botón cerrar X */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar código</Text>
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
            style={{
              marginBottom: 15,
              height: 50,
              backgroundColor: "#dcd4d4f1",
              marginHorizontal: 10,
            }}
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
