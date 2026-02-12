import { useAppStatus } from "@/src/context/TransportAndLocationContext";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Icon, Portal, TouchableRipple } from "react-native-paper";
import destinos from "../utils/destinos.json";

export default function DestinoList() {
  const { destino, setDestino } = useAppStatus();
  const [visible, setVisible] = useState(false);

  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  const label = destino ?? "Destino";

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: visible ? 1 : 0,
      duration: 150,
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
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: visible ? 1 : 0.98,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <>
      <TouchableRipple onPress={() => setVisible((v) => !v)}>
        <View style={styles.trigger}>
          <Animated.View
            style={{
              marginLeft: 4,
              transform: [{ rotate: rotateInterpolate }],
            }}
          >
            <Icon source="chevron-down" size={18} color="#fff" />
          </Animated.View>
          <Text style={styles.triggerText}>{label}</Text>
        </View>
      </TouchableRipple>

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
          {destinos.map((loc) => (
            <Item
              key={loc.id}
              label={loc.nombre}
              onPress={() => {
                setDestino(loc.nombre);
                setVisible(false);
              }}
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
    //paddingHorizontal: 8,
    //justifyContent: "flex-start",
    maxWidth: 150,
    overflow: "scroll",
  },
  triggerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  dropdown: {
    position: "absolute",
    top: 123,
    right: 20,
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
