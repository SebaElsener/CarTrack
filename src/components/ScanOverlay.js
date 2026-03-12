import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

export default function ScanOverlay({ width, height, top, left }) {
  const scanLine = useRef(new Animated.Value(0)).current;

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: height - 4,
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
  }, [height]);

  return (
    <View style={styles.overlay}>
      {/* máscara superior */}
      <View
        style={[
          styles.mask,
          { top: 0, left: 0, width: screenWidth, height: top },
        ]}
      />

      {/* máscara inferior */}
      <View
        style={[
          styles.mask,
          {
            top: top + height,
            left: 0,
            width: screenWidth,
            height: screenHeight - (top + height),
          },
        ]}
      />

      {/* máscara izquierda */}
      <View style={[styles.mask, { top, left: 0, width: left, height }]} />

      {/* máscara derecha */}
      <View
        style={[
          styles.mask,
          {
            top,
            left: left + width,
            width: screenWidth - (left + width),
            height,
          },
        ]}
      />

      {/* área de escaneo */}
      <View style={[styles.scanArea, { top, left, width, height }]}>
        <Animated.View
          style={[styles.scanLine, { transform: [{ translateY: scanLine }] }]}
        />

        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>
    </View>
  );
}

const CORNER = 28;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },

  mask: {
    position: "absolute",
    backgroundColor: "rgba(234,231,231,0.96)",
  },

  scanArea: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
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
