import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Vibration,
  View,
} from "react-native";
import { Button as PaperButton } from "react-native-paper";
import playSound from "../components/plySound";
import { useScans } from "../context/ScanContext";
import { getScans, saveScan } from "../database/Database";
import { requestSync } from "../services/syncTrigger";

/// Area de escaneo
const { width, height } = Dimensions.get("window");
const SCAN_SIZE = width * 0.7;
const TOP = (height - SCAN_SIZE) / 2;
const LEFT = (width - SCAN_SIZE) / 2;

// Mapa y pesos VIN para validación
const VIN_MAP = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
};
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function isValidVIN(vin) {
  if (!vin || vin.length !== 17) return false;
  if (/[IOQ]/.test(vin)) return false;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += VIN_MAP[vin[i]] * VIN_WEIGHTS[i];
  }
  const check = sum % 11;
  const checkChar = check === 10 ? "X" : String(check);
  return vin[8] === checkChar;
}

// ---------------------------
// Animated Button Component
// ---------------------------
function AnimatedButton({ label, onPress, color, textColor, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <PaperButton
          mode="contained"
          buttonColor={color}
          textColor={textColor}
          style={{ borderRadius: 12, paddingVertical: 10 }}
          labelStyle={{ fontSize: 18 }}
        >
          {label}
        </PaperButton>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ---------------------------
// ScannerScreen
// ---------------------------
export default function ScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const [torch, setTorch] = useState(false);
  const [aligned, setAligned] = useState(false);
  const scanLock = useRef(false);
  const { refreshScansCount, incrementScan } = useScans();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: SCAN_SIZE - 4,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleScan = async ({ cornerPoints, type, data }) => {
    if (!cornerPoints || scanLock.current) return;
    if (!data || data.length < 6) return;

    const centerX =
      cornerPoints.reduce((s, p) => s + p.x, 0) / cornerPoints.length;
    const centerY =
      cornerPoints.reduce((s, p) => s + p.y, 0) / cornerPoints.length;
    const inside =
      centerX > LEFT &&
      centerX < LEFT + SCAN_SIZE &&
      centerY > TOP &&
      centerY < TOP + SCAN_SIZE;
    setAligned(inside);
    if (!inside) return;

    scanLock.current = true;
    const vin = data.trim().toUpperCase();

    if (!isValidVIN(vin)) {
      await playSound("error");
      scanLock.current = false;
      return;
    }

    setScanned(true);
    setLastResult(vin);
    Vibration.vibrate(120);
    const alreadyScanned = await getScans({ vin: vin });
    if (!alreadyScanned) {
      await playSound("success");
      await saveScan(vin, type);
      requestSync();
      setTimeout(() => {
        scanLock.current = false;
        setAligned(false);
        refreshScansCount();
        incrementScan();
      }, 1200);
    } else {
      await playSound("error");
      router.push({ pathname: "/(app)/HistoryScreen", params: { vin } });
    }
  };

  if (hasPermission === null) return <Text>Solicitando permisos...</Text>;
  if (hasPermission === false)
    return <Text>No se tiene permiso de cámara</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleScan}
        style={StyleSheet.absoluteFillObject}
        autoFocus={false}
      />

      <TouchableWithoutFeedback onPress={() => setTorch(!torch)}>
        <View style={styles.flashButton}>
          <Text style={styles.flashText}>{torch ? "🔦 OFF" : "🔦 ON"}</Text>
        </View>
      </TouchableWithoutFeedback>

      <Text style={styles.helperText}>Alinee el código dentro del marco</Text>

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={[styles.mask, { height: TOP }]} />
        <View style={styles.centerRow}>
          <View style={[styles.mask, { width: LEFT }]} />
          <View
            style={[
              styles.scanArea,
              {
                borderColor: aligned ? "#00ff88" : "rgba(255,255,255,0.3)",
                borderWidth: 2,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineAnim }] },
              ]}
            />
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={[styles.mask, { width: LEFT }]} />
        </View>
        <View style={[styles.mask, { height: TOP }]} />
      </View>

      {/* Resultado */}
      {scanned && (
        <View style={styles.result}>
          <View style={styles.titleContainer}>
            <Text style={styles.resultText}>{lastResult}</Text>
          </View>

          <AnimatedButton
            label="Daños"
            onPress={() =>
              router.replace({
                pathname: "/(app)/DanoScreen",
                params: { vinFromRouter: lastResult },
              })
            }
            color="rgba(222, 101, 101, 0.95)"
            textColor="rgba(41, 30, 30, 0.89)"
            style={styles.button}
          />

          <AnimatedButton
            label="Tomar fotos"
            onPress={() =>
              router.replace({
                pathname: "/(app)/CameraScreen",
                params: { vinFromRouter: lastResult },
              })
            }
            color="rgba(104, 137, 198, 0.93)"
            textColor="rgba(41, 30, 30, 0.89)"
            style={styles.button}
          />

          <AnimatedButton
            label="Escanear otro"
            onPress={() => {
              setScanned(false);
              scanLock.current = false;
              setAligned(false);
            }}
            color="rgba(115, 175, 98, 1)"
            textColor="rgba(41, 30, 30, 0.89)"
            style={styles.button}
          />
        </View>
      )}
    </View>
  );
}

// ---------------------------
// Styles
// ---------------------------
const CORNER = 28;
const styles = StyleSheet.create({
  container: { flex: 1 },
  result: {
    position: "absolute",
    bottom: 200,
    alignSelf: "center",
    backgroundColor: "rgba(245,245,245,0.95)",
    padding: 30,
    borderRadius: 12,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  resultText: {
    marginBottom: 30,
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f2f2f",
    textAlign: "center",
  },
  button: { marginTop: 16 },
  titleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 16,
  },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center" },
  mask: { backgroundColor: "rgba(0,0,0,0.6)" },
  centerRow: { flexDirection: "row" },
  scanArea: { width: SCAN_SIZE, height: SCAN_SIZE, position: "relative" },
  scanLine: { height: 2, width: "100%", backgroundColor: "#00ff88" },
  helperText: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    color: "#fff",
    fontSize: 16,
    opacity: 0.9,
    zIndex: 20,
  },
  flashButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  flashText: { color: "#fff", fontSize: 14 },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#00ff88",
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
});
