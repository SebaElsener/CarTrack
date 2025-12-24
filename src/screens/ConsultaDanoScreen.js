import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import ConsultaDanoItem from "../components/ConsultaDanoItem";
import { fetchDamageInfo } from "../services/CRUD";

export default function ConsultaDanoScreen() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [vin, setVin] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { lastResult } = useLocalSearchParams();

  // 👉 Cargar VIN desde el scanner (UNA sola vez)
  useEffect(() => {
    if (lastResult) {
      setVin(lastResult);
      setHasSearched(true);
    }
  }, [lastResult]);

  // 👉 Ejecutar búsqueda cuando cambia el VIN y ya hubo búsqueda
  useEffect(() => {
    if (hasSearched && vin) {
      loadData();
    }
  }, [vin, hasSearched]);

  const loadData = async () => {
    if (!vin) return;
    setHasSearched(true);
    try {
      setLoading(true);
      const damageData = await fetchDamageInfo(vin);
      setData(damageData); // incluso si viene []
    } catch (error) {
      console.error("Error fetching damage data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("Datos: ", data);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta de Daños por VIN</Text>

      <TextInput
        value={vin}
        label="Ingresar VIN"
        maxLength={17}
        mode="outlined"
        style={styles.input}
        onBlur={() => setEditing(false)}
        onFocus={() => {
          setVin("");
          setHasInteracted(true);
          setEditing(true);
        }}
        autoCapitalize="characters"
        onChangeText={(text) => setVin(text.toUpperCase())}
      />

      {hasInteracted && vin.length !== 17 && (
        <Text style={{ color: "red", marginTop: 5 }}>
          VIN incompleto ({vin.length}/17)
        </Text>
      )}

      <Button
        mode="contained"
        onPress={() => {
          setHasSearched(true);
          loadData();
          setEditing(false);
        }}
        disabled={vin.length !== 17}
        style={styles.button}
      >
        Consultar
      </Button>

      <Button
        mode="contained"
        onPress={() => router.replace("/(app)/ScannerSolo")}
        style={styles.button}
      >
        Escanear
      </Button>

      <View style={styles.cardContainer}>
        {loading && <ActivityIndicator size="large" />}
        {console.log(loading, hasSearched, editing)}
        {!loading &&
        hasSearched &&
        !editing &&
        getPathDataFromState.damages.length > 0 ? (
          <FlatList
            data={data}
            keyExtractor={(item) => item.supabase_id.toString()}
            renderItem={({ item }) => (
              <ConsultaDanoItem
                item={{
                  damages: item.damages,
                  pictures: item.fotos,
                }}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No se encontraron daños para el VIN proporcionado
              </Text>
            }
          />
        ) : (
          <Text style={styles.emptyText}>
            No se encontraron daños para el VIN proporcionado
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  input: {
    marginTop: 15,
  },
  button: {
    marginTop: 15,
  },
  cardContainer: {
    flex: 1,
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    opacity: 0.7,
  },
});
