import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { IconButton } from "react-native-paper";
import CustomKeyboard from "./CustomKeyboard";
import { isValidVINSoft, normalizeVinChar } from "./vinUtils";

export default function ManualVINInput({ onVinScanned }) {
  const [handInput, setHandInput] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const keyboardTranslateY = useRef(new Animated.Value(370)).current;
  const inputTranslateY = useRef(new Animated.Value(0)).current;

  const cursorOpacity = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (showKeyboard) {
      Animated.parallel([
        Animated.timing(keyboardTranslateY, {
          toValue: -60,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(inputTranslateY, {
          toValue: -160,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(keyboardTranslateY, {
          toValue: 300,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(inputTranslateY, {
          toValue: 0,
          duration: 220,
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

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    setShowKeyboard(false);

    // validar VIN manual
    if (!isValidVINSoft(handInput)) {
      return;
    }

    onVinScanned(handInput);

    setHandInput("");
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: inputTranslateY }] },
      ]}
    >
      <Pressable
        onPressIn={() => !showKeyboard && setShowKeyboard(true)}
        style={styles.fakeInputWrapper}
      >
        <Text style={styles.fakeLabel}>INGRESO MANUAL DE VIN</Text>

        <View style={styles.fakeInput}>
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
        style={{ justifyContent: "center" }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <IconButton
            icon="upload-box"
            size={55}
            iconColor="#37c13a"
            style={styles.button}
          />
        </Animated.View>
      </Pressable>

      {showKeyboard && (
        <TouchableWithoutFeedback onPress={() => setShowKeyboard(false)}>
          <View style={styles.keyboardCloseArea} />
        </TouchableWithoutFeedback>
      )}

      {showKeyboard && (
        <Animated.View
          style={[
            styles.keyboard,
            { transform: [{ translateY: keyboardTranslateY }] },
          ]}
        >
          <CustomKeyboard
            onKeyPress={(char) =>
              setHandInput((v) => normalizeVinChar(char, v))
            }
            onDelete={() => setHandInput((v) => v.slice(0, -1))}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 130,
    alignSelf: "center",
    flexDirection: "row",
    borderWidth: 0.4,
    height: 65,
    backgroundColor: "#aedbdcf2",
    borderRadius: 20,
    zIndex: 999,
  },

  fakeInputWrapper: {
    flexDirection: "row",
    width: 250,
    paddingTop: 13,
  },

  fakeLabel: {
    position: "absolute",
    left: 13,
    top: 3,
    color: "#555",
    fontSize: 14,
  },

  fakeInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
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

  button: {
    justifyContent: "center",
  },

  keyboard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 1000,
  },

  keyboardCloseArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 900,
  },
});
