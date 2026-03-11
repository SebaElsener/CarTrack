import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

export default function ScanOverlay() {
  const scanLine = useRef(new Animated.Value(0)).current;

  const { width, height } = Dimensions.get("window");

  const SIZE = width * 0.7;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: SIZE - 4,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.overlay}>
      <View style={styles.maskTop} />

      <View style={styles.row}>
        <View style={styles.maskSide} />

        <View style={[styles.scanArea, { width: SIZE, height: SIZE }]}>
          <Animated.View
            style={[styles.scanLine, { transform: [{ translateY: scanLine }] }]}
          />

          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <View style={styles.maskSide} />
      </View>

      <View style={styles.maskBottom} />
    </View>
  );
}

const CORNER = 28;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    pointerEvents: "none",
  },

  maskTop: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  maskBottom: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  row: {
    flexDirection: "row",
  },

  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  scanArea: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },

  scanLine: {
    height: 2,
    width: "100%",
    backgroundColor: "#00ff88",
  },

  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#00ff88",
  },

  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
});
