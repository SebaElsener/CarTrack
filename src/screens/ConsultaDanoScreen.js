import { BlurView } from "expo-blur";
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
import { Button, IconButton, TextInput } from "react-native-paper";
import ConsultaDanoCard from "../components/ConsultaDanoCard";
import { fetchDamageInfo } from "../services/CRUD";

export default function ConsultaDanoScreen() {
  const router = useRouter();
  const { vin: vinFromScanner } = useLocalSearchParams();

  const [vin, setVin] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;

  const search = async (value) => {
    if (value.length !== 17) return;

    setLoading(true);
    setSearched(true);
    setData([]);

    try {
      const res = await fetchDamageInfo(value);
      setData(res || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vinFromScanner?.length === 17) {
      setVin(vinFromScanner);
      search(vinFromScanner);
    }
  }, [vinFromScanner]);

  useEffect(() => {
    if (data.length > 0) {
      fade.setValue(0);
      translate.setValue(20);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [data]);

  return (
    <View style={styles.container}>
      {/* Glass panel */}
      <BlurView intensity={40} tint="light" style={styles.glass}>
        <Text style={styles.title}>Consulta de Daños</Text>

        <TextInput
          label="VIN"
          mode="outlined"
          value={vin}
          maxLength={17}
          autoCapitalize="characters"
          style={styles.input}
          onChangeText={(t) => setVin(t.toUpperCase())}
          right={
            vin.length === 17 && (
              <TextInput.Icon icon="check-circle" color="#2ecc71" />
            )
          }
        />

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="magnify"
            onPress={() => search(vin)}
            disabled={vin.length !== 17 || loading}
            style={styles.searchBtn}
          >
            Consultar
          </Button>

          <IconButton
            icon="barcode-scan"
            size={34}
            style={styles.scanBtn}
            onPress={() => router.push("/ScannerSolo")}
          />
        </View>
      </BlurView>

      {/* Results */}
      <View style={styles.results}>
        {loading && <ActivityIndicator size="large" />}

        {!loading && searched && data.length === 0 && (
          <Text style={styles.empty}>No existen daños para este VIN</Text>
        )}

        {!loading && data.length > 0 && (
          <Animated.View
            style={{
              flex: 1,
              opacity: fade,
              transform: [{ translateY: translate }],
            }}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.supabase_id.toString()}
              renderItem={({ item }) => <ConsultaDanoCard item={item} />}
              contentContainerStyle={{ paddingBottom: 30 }}
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
    padding: 16,
  },

  /* Glass panel superior */
  glass: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    color: "#262626c8",
  },

  input: {
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  searchBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 6,
    backgroundColor: "#444df0b1",
  },

  scanBtn: {
    marginLeft: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 14,
  },

  /* Resultados */
  results: {
    flex: 1,
    marginTop: 8,
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
    opacity: 0.6,
  },
});
