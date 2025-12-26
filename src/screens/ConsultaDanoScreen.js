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

  // 🎬 Animación input
  const focusAnim = useRef(new Animated.Value(0)).current;

  // 🎬 Animación resultados
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  const isValidVin = vin.length === 17;
  const isInvalidVin = vin.length > 0 && vin.length < 17;

  // 🔎 Buscar VIN
  const search = async (value) => {
    if (value.length !== 17) return;

    try {
      setLoading(true);
      setSearched(true);
      setData([]); // 🔴 limpia datos previos

      const res = await fetchDamageInfo(value);
      setData(res || []);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 📲 VIN desde scanner
  useEffect(() => {
    if (typeof vinFromScanner === "string" && vinFromScanner.length === 17) {
      setVin(vinFromScanner);
      search(vinFromScanner);
    }
  }, [vinFromScanner]);

  // 🎬 Animar cards
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

  // 🎬 Animar focus input
  const handleFocus = () => {
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const animatedScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const animatedShadow = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.25],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta de Daños por VIN</Text>

      {/* 🔤 INPUT VIN */}
      <Animated.View
        style={{
          transform: [{ scale: animatedScale }],
          shadowColor: isValidVin
            ? "#2ecc71"
            : isInvalidVin
            ? "#e74c3c"
            : "#000",
          shadowOpacity: animatedShadow,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <TextInput
          value={vin}
          label="Ingresar VIN"
          maxLength={17}
          mode="outlined"
          style={styles.input}
          autoCapitalize="characters"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={(text) => setVin(text.toUpperCase())}
          theme={{
            colors: {
              primary: isValidVin
                ? "#2ecc71"
                : isInvalidVin
                ? "#e74c3c"
                : "#6200ee",
              outline: isValidVin
                ? "#2ecc71"
                : isInvalidVin
                ? "#e74c3c"
                : "#999",
              background: "#fff",
            },
          }}
        />
      </Animated.View>

      {isInvalidVin && (
        <Text style={styles.vinError}>VIN incompleto ({vin.length}/17)</Text>
      )}

      {isValidVin && <Text style={styles.vinOk}>VIN válido ✓</Text>}

      {/* 🔘 BOTONES */}
      <Button
        mode="contained"
        onPress={() => search(vin)}
        disabled={!isValidVin}
        style={styles.button}
      >
        Consultar
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.replace("/(app)/ScannerSolo")}
        style={styles.button}
      >
        Escanear
      </Button>

      {/* 🧾 RESULTADOS */}
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
              keyExtractor={(item) =>
                item.supabase_id?.toString() ?? Math.random().toString()
              }
              renderItem={({ item }) => <ConsultaDanoItem item={item} />}
              showsVerticalScrollIndicator={false}
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
    color: "#242424b8",
  },
  input: {
    marginTop: 15,
    backgroundColor: "#fff", // 🔴 FIX label sobre línea
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
    color: "#e74c3c",
    marginTop: 5,
    fontWeight: "700",
  },
  vinOk: {
    color: "#2ecc71",
    marginTop: 5,
    fontWeight: "700",
  },
});
