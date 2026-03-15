import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import destinos from "../utils/destinos.json";

export default function PositionPanel({ destino, onDestinoChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const destinosFiltrados = destinos.filter((d) =>
    d.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  const selectDestino = (d) => {
    onDestinoChange(d.id);
    setSearch(d.nombre);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar destino..."
        value={search}
        onFocus={() => setOpen(true)}
        onChangeText={(t) => {
          setSearch(t);
          setOpen(true);
        }}
        style={styles.input}
      />

      {open && (
        <FlatList
          data={destinosFiltrados}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.item} onPress={() => selectDestino(item)}>
              <Text style={styles.itemText}>{item.nombre}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#9deb91",
    padding: 10,
    borderRadius: 10,
  },

  input: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  list: {
    maxHeight: 180,
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 6,
  },

  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  itemText: {
    fontSize: 16,
  },
});
