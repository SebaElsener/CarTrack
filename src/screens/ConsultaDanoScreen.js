import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, IconButton } from "react-native-paper";
import ConsultaDanoCard from "../components/ConsultaDanoCard";
import CustomKeyboard from "../components/CustomKeyboard";
import { fetchDamageInfo } from "../services/CRUD";

const areas = require("../utils/areas.json");
const averias = require("../utils/averias.json");
const gravedades = require("../utils/gravedades.json");

// --- VIN helpers ---
const normalizeVinChar = (char, current) => {
  const c = char.toUpperCase();

  // ❌ Bloquear I O Q
  if (c === "I" || c === "O" || c === "Q") return current;

  // 🔢 Máximo 17
  if (current.length >= 17) return current;

  return current + c;
};

export default function ConsultaDanoScreen() {
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const router = useRouter();
  const { vin: vinFromScanner } = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [vin, setVin] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const keyboardTranslateY = useRef(new Animated.Value(370)).current;

  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;

  const indexById = (arr) =>
    Object.fromEntries(arr.map((i) => [i.id, i.descripcion]));

  const areasMap = indexById(areas);
  const averiasMap = indexById(averias);
  const gravedadesMap = indexById(gravedades);

  const labelAnim = useRef(new Animated.Value(0)).current;
  // 0 = label abajo
  // 1 = label arriba

  useEffect(() => {
    const shouldFloat = showKeyboard || vin.length > 0;

    Animated.timing(labelAnim, {
      toValue: shouldFloat ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [showKeyboard, vin]);

  const isVinComplete = vin.length === 17;
  const isVinInvalid = vin.length > 0 && vin.length < 17;

  const borderColor = isVinComplete
    ? "#2ecc71" // verde
    : isVinInvalid
    ? "#e74c3c" // rojo
    : "#aaa"; // neutro

  const search = async (value) => {
    Keyboard.dismiss();
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
    if (showKeyboard) {
      Animated.parallel([
        Animated.timing(keyboardTranslateY, {
          toValue: -70,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(keyboardTranslateY, {
          toValue: 300,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showKeyboard]);

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
    setShowKeyboard(false);
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

        <Pressable
          onPressIn={() => {
            if (!showKeyboard) setShowKeyboard(true);
          }}
          style={styles.fakeInputWrapper}
        >
          {/* LABEL FLOTANTE */}
          <Animated.Text
            style={[
              styles.fakeLabel,
              {
                transform: [
                  {
                    translateY: labelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, -6],
                    }),
                  },
                  {
                    scale: labelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.85],
                    }),
                  },
                ],
              },
            ]}
          >
            INGRESO MANUAL DE VIN
          </Animated.Text>

          {/* INPUT */}
          <View style={[styles.fakeInput, { borderColor }]}>
            <Text style={styles.vinText}>{vin}</Text>

            {showKeyboard && vin.length < 17 && (
              <Animated.View
                style={[styles.cursor, { opacity: cursorOpacity }]}
              />
            )}
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="magnify"
            onPress={() => {
              search(vin);
              setShowKeyboard(false);
            }}
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
      {/* TAP FUERA PARA CERRAR TECLADO */}
      {showKeyboard && (
        <TouchableWithoutFeedback onPress={() => setShowKeyboard(false)}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 900, // 👈 MENOR que el teclado
            }}
          />
        </TouchableWithoutFeedback>
      )}
      {showKeyboard && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 12,
            //width: "100%",
            //alignItems: "center",
            transform: [{ translateY: keyboardTranslateY }],
            zIndex: 1000,
          }}
        >
          <CustomKeyboard
            onKeyPress={(char) => setVin((v) => normalizeVinChar(char, v))}
            onDelete={() => setVin((v) => v.slice(0, -1))}
          />
        </Animated.View>
      )}
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
    marginTop: 10,
    color: "#d12727",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
    opacity: 0.6,
  },
  fakeInputWrapper: {
    paddingTop: 18,
  },
  fakeLabel: {
    position: "absolute",
    left: 5,
    top: 5,
    color: "#555",
    fontSize: 14,
    backgroundColor: "transparent", // mismo fondo del container
    paddingHorizontal: 4,
    zIndex: 10,
  },
  fakeInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 8,
    //backgroundColor: "#ffffff63",
    paddingHorizontal: 12,
    borderWidth: 1,
    //marginLeft: -12,
    //width: "100%",
  },
  vinText: {
    fontSize: 18,
    letterSpacing: 1.5,
    color: "#000",
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: "#000",
    marginLeft: 2,
  },
});
