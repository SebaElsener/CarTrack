import { StyleSheet, Text, View } from "react-native";

export default function PositionPanel({
  // destino,
  // onDestinoChange,
  origen,
  destinoNombre,
}) {
  // const [search, setSearch] = useState("");
  // const [open, setOpen] = useState(false);

  // const destinosFiltrados = destinos.filter((d) =>
  //   d.nombre.toLowerCase().includes(search.toLowerCase()),
  // );

  // const selectDestino = (d) => {
  //   onDestinoChange(d.id);
  //   setSearch(d.nombre);
  //   setOpen(false);
  // };

  return (
    <View style={styles.container}>
      {origen && (
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: 4,
            fontSize: 18,
            color: "#1aa901f4",
          }}
        >
          Origen: {origen}
        </Text>
      )}

      {destinoNombre && (
        <Text style={{ fontWeight: "bold", marginBottom: 8, fontSize: 18 }}>
          Destino: {destinoNombre}
        </Text>
      )}
      {/* <TextInput
        placeholder="Buscar destino..."
        value={search}
        onFocus={() => setOpen(true)}
        onChangeText={(t) => {
          setSearch(t);
          setOpen(true);
        }}
        style={styles.input}
      /> */}

      {/* {open && (
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
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f6f4f2",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
