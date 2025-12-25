import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
  const { vin: vinFromScanner } = useLocalSearchParams();

  const [vin, setVin] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  // 🔁 Búsqueda única (input + scanner)
  const search = async (value) => {
    if (value.length !== 17) return;

    try {
      setLoading(true);
      setSearched(true);

      const res = await fetchDamageInfo(value);
      setData(res ?? []);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 📲 VIN desde scanner (una sola vez)
  useEffect(() => {
    if (vinFromScanner && vinFromScanner.length === 17) {
      setVin(vinFromScanner);
      search(vinFromScanner);
    }
  }, [vinFromScanner]);

  // 🎬 Animar resultados
  useEffect(() => {
    if (data.length > 0) {
      fadeAnim.setValue(0);
      translateAnim.setValue(20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [data]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta de Daños por VIN</Text>

      <TextInput
        value={vin}
        label="Ingresar VIN"
        maxLength={17}
        mode="outlined"
        style={styles.input}
        autoCapitalize="characters"
        onChangeText={(text) => setVin(text.toUpperCase())}
      />

      {vin.length > 0 && vin.length < 17 && (
        <Text style={styles.vinError}>VIN incompleto ({vin.length}/17)</Text>
      )}

      <Button
        mode="contained"
        onPress={() => search(vin)}
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

        {!loading && searched && data.length === 0 && (
          <Text style={styles.emptyText}>
            No se encontraron daños para el VIN proporcionado
          </Text>
        )}

        {!loading && data.length > 0 && (
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            }}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.supabase_id.toString()}
              renderItem={({ item }) => <ConsultaDanoItem item={item} />}
            />
          </Animated.View>
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
  vinError: {
    color: "#f80c0c84",
    marginTop: 5,
    fontWeight: "700",
  },
});
