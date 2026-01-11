import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import ConsultaDanoCard from "../components/ConsultaDanoCard";
import { fetchDamageInfo } from "../services/CRUD";

const areas = require("../utils/areas.json");
const averias = require("../utils/averias.json");
const gravedades = require("../utils/gravedades.json");

export default function ConsultaDanoScreen() {
  const router = useRouter();
  const { vin: vinFromScanner } = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [vin, setVin] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;

  const indexById = (arr) =>
    Object.fromEntries(arr.map((i) => [i.id, i.descripcion]));

  const areasMap = indexById(areas);
  const averiasMap = indexById(averias);
  const gravedadesMap = indexById(gravedades);

  const search = async (value) => {
    if (value.length !== 17) return;

    setLoading(true);
    setSearched(true);
    setData([]);

    try {
      const res = await fetchDamageInfo(value);
      const transformScans = res.map((scan) => ({
        ...scan,
        damages: scan.damages.map((d) => ({
          ...d,
          area_desc: areasMap[d.area] ?? null,
          averia_desc: averiasMap[d.averia] ?? null,
          grav_desc: gravedadesMap[d.grav] ?? null,
        })),
      }));

      setData(transformScans || []);
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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    router.push("/ScannerSolo"); // navegación al escáner
  };

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

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <IconButton
                mode="contained"
                icon="barcode-scan"
                size={55}
                style={styles.scanBtn}
                containerColor="transparent"
              ></IconButton>
            </Animated.View>
          </Pressable>
        </View>
      </BlurView>

      {/* Results */}
      <View style={styles.results}>
        {loading && <ActivityIndicator size="large" />}

        {!loading && searched && data.length === 0 && (
          <Text style={styles.empty}>
            El VIN consultado{"\n"}no existe en la base de datos
          </Text>
        )}
        {!loading && searched && data[0]?.damages?.length === 0 && (
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
    marginLeft: 20,
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
    fontSize: 18,
    opacity: 0.6,
  },
});
