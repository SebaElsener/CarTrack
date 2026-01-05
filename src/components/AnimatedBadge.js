import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

export default function AnimatedBadge({ value }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;

    prevValue.current = value;

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [value]);

  //if (value <= 0) return null;

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <Text style={styles.text}>{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    //backgroundColor: "#9f9898df",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    //marginLeft: 6,
  },
  text: {
    color: "#f7f7f7ff",
    fontWeight: "700",
    fontSize: 14,
  },
});
