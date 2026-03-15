import { Camera, CameraView } from "expo-camera";
import { useKeepAwake } from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Vibration,
  View,
} from "react-native";
import { IconButton } from "react-native-paper";
import CustomKeyboard from "../components/CustomKeyboard";
import playSound from "../components/plySound";
import PositionPanel from "../components/PositionPanel";
import ScanOverlay from "../components/ScanOverlay";

// ---------------------------
// VIN validation
// ---------------------------
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

const COMMON_CONFUSIONS = {
  O: ["0"],
  0: ["O"],
  I: ["1"],
  1: ["I"],
  S: ["5"],
  5: ["S"],
  B: ["8"],
  8: ["B"],
  Z: ["2"],
  2: ["Z"],
  G: ["6"],
  6: ["G"],
};

const CHECK_DIGIT_EXCEPTIONS = {
  // WMI : array de dígitos permitidos aunque no coincidan con ISO
  "9BD": [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "X",
    "G",
    "N",
    "K",
    "S",
    "U",
    "B",
    "F",
  ], // Fiat Brasil
  "93H": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], // Honda Brasil
  "9BG": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], // GM Brasil
  "8AJ": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "X"], // Toyota Argentina
  "93Y": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "X"], // Renault Brasil
  "8A1": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "X", "G"], // Renault Argentina
  "94D": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "X"], // Nissan Brasil
};

// --- VIN helpers ---
const normalizeVinChar = (char, current) => {
  const c = char.toUpperCase();

  // ❌ Bloquear I O Q
  if (c === "I" || c === "O" || c === "Q") return current;

  // 🔢 Máximo 17
  if (current.length >= 17) return current;

  return current + c;
};

export function isValidVIN(vin) {
  if (!vin || vin.length !== 17) return false;
  if (/[IOQ]/.test(vin)) return false;
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return false;

  const wmi = vin.slice(0, 3);

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += VIN_MAP[vin[i]] * VIN_WEIGHTS[i];
  }

  const check = sum % 11;
  const checkChar = check === 10 ? "X" : String(check);

  // ✅ Caso normal ISO
  if (vin[8] === checkChar) return true;

  // ⚠️ Excepción controlada por fabricante
  if (
    CHECK_DIGIT_EXCEPTIONS[wmi] &&
    CHECK_DIGIT_EXCEPTIONS[wmi].includes(vin[8])
  ) {
    console.log(`Check digit excepción aplicada para ${wmi}: ${vin}`);
    return true;
  }

  return false;
}

function isValidVINSoft(vin) {
  return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

function attemptVinAutoFixOEM(vin) {
  if (!vin || vin.length !== 17) return null;

  // No intentar si ya es válido
  if (isValidVIN(vin)) return vin;

  for (let i = 0; i < 17; i++) {
    // 🚫 Nunca tocar dígito verificador
    if (i === 8) continue;

    const originalChar = vin[i];
    const possibleReplacements = COMMON_CONFUSIONS[originalChar];

    if (!possibleReplacements) continue;

    for (let replacement of possibleReplacements) {
      const candidate = vin.slice(0, i) + replacement + vin.slice(i + 1);

      // Validar formato VIN antes de calcular
      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(candidate)) continue;

      if (isValidVIN(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

// ---------------------------
// Animated Button
// ---------------------------
// function AnimatedButton({ label, onPress, color, textColor, style }) {
//   const scale = useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(scale, {
//       toValue: 0.95,
//       friction: 3,
//       useNativeDriver: true,
//     }).start();
//   };
//   const handlePressOut = () => {
//     Animated.spring(scale, {
//       toValue: 1,
//       friction: 3,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <TouchableWithoutFeedback
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//       onPress={onPress}
//     >
//       <Animated.View style={[{ transform: [{ scale }] }, style]}>
//         <PaperButton
//           mode="contained"
//           buttonColor={color}
//           textColor={textColor}
//           style={{ borderRadius: 12, paddingVertical: 10 }}
//           labelStyle={{ fontSize: 18 }}
//         >
//           {label}
//         </PaperButton>
//       </Animated.View>
//     </TouchableWithoutFeedback>
//   );
// }

// ---------------------------
// ScannerScreen
// ---------------------------
export default function ScannerScreen() {
  useKeepAwake(); // Mantener pantalla activa
  const [hasPermission, setHasPermission] = useState(null);
  const [lastResult, setLastResult] = useState("");
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const [aligned, setAligned] = useState(false);
  const scanLock = useRef(false);
  const errorLock = useRef(false);
  const [handInput, setHandInput] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showKeyboard, setShowKeyboard] = useState(false);
  const keyboardTranslateY = useRef(new Animated.Value(370)).current;
  const inputTranslateY = useRef(new Animated.Value(0)).current;
  const lastVinRef = useRef(null);

  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {}, [lastResult]);

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
      ]),
    ).start();
  }, []);

  const labelAnim = useRef(new Animated.Value(0)).current;
  // 0 = label abajo
  // 1 = label arriba

  useEffect(() => {
    const shouldFloat = showKeyboard || handInput.length > 0;

    Animated.timing(labelAnim, {
      toValue: shouldFloat ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [showKeyboard, handInput]);

  const isVinComplete = handInput.length === 17;
  const isVinInvalid = handInput.length > 0 && handInput.length < 17;

  const borderColor = isVinComplete
    ? "#2ecc71" // verde
    : isVinInvalid
      ? "#e74c3c" // rojo
      : "#aaa"; // neutro

  // ---------------------------
  // Animación imput manual VIN
  // ---------------------------
  const fakeCornerPoints = [
    /// Coordenada falsas para ingreso manual VIN
    { x: 220.13072204589844, y: 277.6470642089844 },
    { x: 220.13072204589844, y: 373.856201171875 },
    { x: 326.2745056152344, y: 372.2875671386719 },
    { x: 326.2745056152344, y: 276.601318359375 },
  ];

  // ---------------------------
  // Detectar orientación
  // ---------------------------
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  // const orientation =
  //   dimensions.height >= dimensions.width ? "portrait" : "landscape";

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) =>
      setDimensions(window),
    );
    return () => sub?.remove();
  }, []);

  const SCAN_WIDTH = dimensions.width * 1;
  const SCAN_HEIGHT = SCAN_WIDTH * 0.35;

  const SCAN_TOP = (dimensions.height - SCAN_HEIGHT) / 2;
  const SCAN_LEFT = (dimensions.width - SCAN_WIDTH) / 2;

  // ---------------------------
  // Camera permissions
  // ---------------------------
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  // ---------------------------
  // Animación de línea
  // ---------------------------
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: SCAN_HEIGHT - 4,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (!showKeyboard) {
      inputTranslateY.setValue(0);
      setHandInput("");
    }
  }, [showKeyboard]);

  useEffect(() => {
    if (showKeyboard) {
      Animated.parallel([
        Animated.timing(keyboardTranslateY, {
          toValue: -60,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(inputTranslateY, {
          toValue: -160, // ⬆️ sube el input
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
        Animated.timing(inputTranslateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showKeyboard]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = async () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    setShowKeyboard(false); // 👈 OCULTA TECLADO

    await handleScan({
      cornerPoints: fakeCornerPoints,
      type: "handInput",
      data: handInput,
    });
  };

  // ---------------------------
  // Manejo de scans
  // ---------------------------
  const handleScan = async ({ cornerPoints, type, data }) => {
    console.log(type, data);
    if (scanLock.current || errorLock.current) return;

    // 🔹 Normalización inicial
    let vinOriginal = data?.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // 🔹 Tomar solo los primeros 17 caracteres (ignorar extras)
    vinOriginal = vinOriginal.slice(0, 17);

    if (!vinOriginal || vinOriginal.length !== 17) {
      await playSound("error");
      return;
    }

    let vinFinal = vinOriginal;

    // Validar ingreso manual sin dígito verificador
    if (type === "handInput") {
      if (!isValidVINSoft(vinOriginal)) {
        await playSound("error");
        return;
      }
    }

    // Validar ingreso por scanner con dígito verificador
    if (type !== "handInput") {
      if (!isValidVIN(vinOriginal)) {
        const fixedVin = attemptVinAutoFixOEM(vinOriginal);

        if (fixedVin && fixedVin !== vinOriginal) {
          console.log("VIN autocorregido:", vinOriginal, "→", fixedVin);
          vinFinal = fixedVin;
        } else {
          await playSound("error");
          return;
        }
      }
    }

    // 🔹 Validación geométrica SOLO para cámara
    if (type !== "handInput") {
      if (!cornerPoints) return;

      const centerX =
        cornerPoints.reduce((s, p) => s + p.x, 0) / cornerPoints.length;

      const centerY =
        cornerPoints.reduce((s, p) => s + p.y, 0) / cornerPoints.length;

      const inside =
        centerX > SCAN_LEFT &&
        centerX < SCAN_LEFT + SCAN_WIDTH &&
        centerY > SCAN_TOP &&
        centerY < SCAN_TOP + SCAN_HEIGHT;

      setAligned(inside);

      if (!inside) return;
    }

    if (vinFinal === lastVinRef.current) return;
    scanLock.current = true;

    lastVinRef.current = vinFinal;
    setLastResult(vinFinal);
    Vibration.vibrate(120);

    await playSound("success");

    setTimeout(() => {
      scanLock.current = false;
      setAligned(false);
    }, 400);
  };

  if (hasPermission === null) return <Text>Solicitando permisos...</Text>;
  if (hasPermission === false)
    return <Text>No se tiene permiso de cámara</Text>;

  const closeKeyboard = () => {
    setShowKeyboard(false);

    Animated.parallel([
      Animated.timing(keyboardTranslateY, {
        toValue: 300,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(inputTranslateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleScan}
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "datamatrix", "code128", "code39"],
        }}
        autoFocus="on"
        enableTorch={false}
      />

      <ScanOverlay
        width={SCAN_WIDTH}
        height={SCAN_HEIGHT}
        top={SCAN_TOP}
        left={SCAN_LEFT}
      />

      {/* <Text style={styles.helperText}>Alinee el código dentro del marco</Text> */}

      {/* ////////////////////////////////////////////////////// */}
      {/* Panel de posicionamiento */}

      <View style={styles.positionPanelContainer}>
        <PositionPanel vin={lastResult} />
      </View>

      <Animated.View
        style={[
          styles.handInputVINContainer,
          {
            transform: [{ translateY: inputTranslateY }],
          },
        ]}
      >
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
            <Text style={styles.vinText}>{handInput}</Text>

            {showKeyboard && handInput.length < 17 && (
              <Animated.View
                style={[styles.cursor, { opacity: cursorOpacity }]}
              />
            )}
          </View>
        </Pressable>

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            //alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <IconButton
              mode="contained"
              icon="upload-box"
              size={55}
              iconColor="#37c13afd"
              style={styles.handInputBtn}
              containerColor="transparent"
            ></IconButton>
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* ////////////////////////////////////////////////////// */}
      {/* TAP FUERA PARA CERRAR TECLADO */}
      {showKeyboard && (
        <TouchableWithoutFeedback onPress={closeKeyboard}>
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
            width: "100%",
            transform: [{ translateY: keyboardTranslateY }],
            zIndex: 1000,
          }}
        >
          <CustomKeyboard
            onKeyPress={(char) =>
              setHandInput((v) => normalizeVinChar(char, v))
            }
            onDelete={() => setHandInput((v) => v.slice(0, -1))}
          />
        </Animated.View>
      )}
    </View>
  );
}

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, position: "relative", backgroundColor: "#ebe5e5ea" },
  result: {
    position: "absolute",
    bottom: 150,
    alignSelf: "center",
    backgroundColor: "rgba(245,245,245,0.95)",
    padding: 30,
    borderRadius: 12,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 999999,
  },
  resultText: {
    marginBottom: 30,
    fontSize: 19,
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
  helperText: {
    position: "absolute",
    bottom: 505,
    alignSelf: "center",
    color: "#1b1919f5",
    fontSize: 14,
    zIndex: 20,
    backgroundColor: "#e2a063f8",
    padding: 8,
    borderRadius: 15,
  },
  handInputVIN: {
    //backgroundColor: "#c1d1d4ff",
    width: 270,
    //verticalAlign: "center",
    //height: "100%",
    //alignSelf: "center",
  },
  handInputVINContainer: {
    position: "absolute",
    bottom: 130,
    //left: 0,
    //right: 0,
    alignSelf: "center",
    flexDirection: "row",
    borderColor: "rgba(249, 249, 249, 0.9)",
    borderWidth: 0.4,
    height: 65,
    backgroundColor: "#aedbdcfe",
    //paddingLeft: 10,
    borderRadius: 20,
    zIndex: 999,
    //justifyContent: "space-between",
    //alignContent: "center",
    //display: "flex",
    //alignItems: "center",
  },
  // flashButton: {
  //   position: "absolute",
  //   top: 20,
  //   right: 20,
  //   backgroundColor: "rgba(0,0,0,0.6)",
  //   padding: 10,
  //   borderRadius: 20,
  //   zIndex: 10,
  // },
  // flashText: { color: "#fff", fontSize: 14 },
  handInputBtn: {
    justifyContent: "center",
    //color: "gray",
  },
  textInputVIN: {
    // width: 270,
    //height: 55,
    // justifyContent: "center",
    //backgroundColor: "yellow",
  },
  fakeInputWrapper: {
    flexDirection: "row",
    width: 250,
    alignContent: "center",
    paddingTop: 13,
  },
  fakeLabel: {
    position: "absolute",
    left: 13,
    top: 3,
    color: "#555",
    fontSize: 14,
    backgroundColor: "transparent", // mismo fondo del container
    paddingHorizontal: 4,
    zIndex: 10,
  },
  fakeInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
    //backgroundColor: "#ffffff63",
    paddingHorizontal: 8,
    borderWidth: 1,
    marginLeft: 10,
    width: "100%",
  },
  vinText: {
    fontSize: 16,
    letterSpacing: 1,
    color: "#000",
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: "#000",
    marginLeft: 2,
  },
  errorBanner: {
    position: "absolute",
    //top: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
    //left: 18,
    zIndex: 50,
  },

  errorText: {
    color: "rgba(211, 56, 56, 0.96)",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    position: "absolute",
    top: 15,
    //right: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  toggleLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
});
