import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Portal, TouchableRipple } from "react-native-paper";
import { useAppStatus } from "../context/TransportAndLocationContext";
import { LOCACIONES } from "../services/gps/locationUtil";

export default function LocationStatusBar() {
  const { lugar, lugarGPS, lugarManual, setLugarManual } = useAppStatus();
  const [visible, setVisible] = useState(false);

  console.log("Lugar actual:", lugar);

  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  const esEditable = lugarGPS === null;

  let backgroundColor;

  if (lugarManual) {
    backgroundColor = "#dcb12583"; // 🟡 manual (ej. amarillo)
  } else if (lugarGPS) {
    backgroundColor = "#24882b61"; // 🟢 gps
  } else {
    backgroundColor = "#b30e2c9e"; // 🔴 fuera de zona
  }

  // 🔄 animación flecha
  useEffect(() => {
    Animated.timing(rotate, {
      toValue: visible ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // 🔄 animación dropdown
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -8,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: visible ? 1 : 0.98,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const seleccionarLugar = (nombre) => {
    setLugarManual(nombre);
    setVisible(false);
  };

  return (
    <>
      {/* TRIGGER */}
      <TouchableRipple
        disabled={!esEditable}
        borderless
        onPress={() => esEditable && setVisible((v) => !v)}
      >
        <View style={[styles.trigger, { backgroundColor }]}>
          <Text style={styles.triggerText}>{lugar ?? "Detectando..."}</Text>
          {/* 
          {esEditable && (
            <Animated.View
              style={{
                //marginLeft: 4,
                transform: [{ rotate: rotateInterpolate }],
              }}
            >
              <Icon source="chevron-down" size={16} color="#fff" />
            </Animated.View>
          )} */}
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
          {LOCACIONES.map((loc) => (
            <Item
              key={loc.nombre}
              label={loc.nombre}
              onPress={() => seleccionarLugar(loc.nombre)}
            />
          ))}
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
    justifyContent: "center",
    height: 55,
    ///paddingHorizontal: 8,
    //borderRadius: 6,
  },
  triggerText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  dropdown: {
    position: "absolute",
    top: 165, // ajustar según tu header
    right: 40,
    backgroundColor: "#ded7d7e3",
    borderRadius: 6,
    minWidth: 130,
    elevation: 8,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  itemText: {
    fontSize: 14,
    color: "#3a3838",
    fontWeight: "500",
  },
});
