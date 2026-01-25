import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Icon, Portal, TouchableRipple } from "react-native-paper";
import { useScans } from "../context/ScanContext";

export default function IngDespList() {
  const [visible, setVisible] = useState(false);
  const { movimiento, setMovimiento } = useScans();
  const rotate = useRef(new Animated.Value(0)).current;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  const label =
    movimiento === "INGRESO"
      ? "Ingreso"
      : movimiento === "DESPACHO"
        ? "Despacho"
        : "Movimiento";

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: visible ? 1 : 0,
      delay: visible ? 0 : 60,
      duration: visible ? 160 : 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 160 : 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -8,
        duration: visible ? 160 : 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: visible ? 1 : 0.98,
        duration: visible ? 160 : 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <>
      {/* TRIGGER EN HEADER */}
      <TouchableRipple
        hitSlop={10}
        borderless
        onPress={() => setVisible((v) => !v)}
      >
        <View style={styles.trigger}>
          <Text style={styles.triggerText}>{label}</Text>
          <Animated.View
            style={{
              marginLeft: 4,
              transform: [{ rotate: rotateInterpolate }],
            }}
          >
            <Icon source="chevron-down" size={18} color="#fff" />
          </Animated.View>
        </View>
      </TouchableRipple>

      {/* DROPDOWN */}
      <Portal>
        {visible && (
          <TouchableRipple
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          >
            <View />
          </TouchableRipple>
        )}

        <Animated.View
          pointerEvents={visible ? "auto" : "none"}
          style={[
            styles.dropdown,
            {
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <Item
            label="Ingreso"
            onPress={() => {
              setMovimiento("INGRESO");
              setVisible(false);
            }}
          />
          <Item
            label="Despacho"
            onPress={() => {
              setMovimiento("DESPACHO");
              setVisible(false);
            }}
          />
        </Animated.View>
      </Portal>
    </>
  );
}

function Item({ label, onPress }) {
  return (
    <TouchableRipple onPress={onPress}>
      <View style={styles.item}>
        <Text style={styles.itemText}>{label}</Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  triggerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  dropdown: {
    position: "absolute",
    top: 163,
    right: 80,
    backgroundColor: "#ded7d7e3",
    borderRadius: 6,
    minWidth: 110,
    elevation: 8,
    //paddingVertical: 4,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  itemText: {
    fontSize: 14,
    color: "#3a3838",
    fontWeight: 500,
  },
});
