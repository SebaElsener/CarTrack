import { useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const KEYBOARD_WIDTH = Math.min(SCREEN_WIDTH - 24, 420);

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const LETTERS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

export default function CustomKeyboard({ onKeyPress, onDelete }) {
  return (
    <View style={[styles.keyboard, { width: KEYBOARD_WIDTH }]}>
      {/* NUMEROS */}
      <Row>
        {NUMBERS.map((n) => (
          <Key key={n} label={n} onPress={() => onKeyPress(n)} />
        ))}
      </Row>

      {/* LETRAS */}
      {LETTERS.map((row, i) => (
        <Row key={i}>
          {row.map((l) => (
            <Key
              key={l}
              label={l}
              onPress={() => onKeyPress(l)}
              onDelete={onDelete}
            />
          ))}
        </Row>
      ))}
    </View>
  );
}

function Row({ children }) {
  return <View style={styles.row}>{children}</View>;
}

function Key({ label, onPress, onDelete, wide = false }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    Vibration.vibrate(40);
    if (label === "⌫") {
      onDelete();
    } else {
      onPress(label);
    }
  };

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View
        style={[
          styles.key,
          wide && styles.wide,
          { transform: [{ scale }], opacity },
        ]}
      >
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    alignSelf: "center",
    backgroundColor: "#2e66aeb2",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 14,
    marginTop: 6,
    zIndex: 99999,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  key: {
    backgroundColor: "#fff",
    borderRadius: 7,
    paddingVertical: 8,
    marginHorizontal: 3,
    minWidth: KEYBOARD_WIDTH / 11,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  wide: {
    minWidth: KEYBOARD_WIDTH / 3,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
});
