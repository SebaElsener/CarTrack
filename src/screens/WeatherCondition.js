import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Icon, Portal, SegmentedButtons } from "react-native-paper";
import { useScans } from "../context/ScanContext";

export default function WeatherCondition() {
  const {
    weatherCondition,
    setWeatherCondition,
    weatherError,
    setWeatherError,
  } = useScans();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [weatherCondition]);

  const renderLabel = (value, icon, label) => {
    const active = weatherCondition === value;

    return (
      <View style={{ alignItems: "center", gap: 4 }}>
        <Animated.View
          style={{ transform: [{ scale: active ? scaleAnim : 1 }] }}
        >
          <Icon source={icon} size={22} color="#eeeeeeff" />
        </Animated.View>
        <Text style={{ fontSize: 11, textAlign: "center", color: "#eeeeeeff" }}>
          {label}
        </Text>
      </View>
    );
  };

  const buttonColors = {
    sol: "#FFC10755",
    noche: "#673AB755",
    lluvia: "#2196F355",
    rocío: "#00BCD455",
    hielo: "#b0ecf474",
  };

  const theme = {
    colors: {
      secondaryContainer: buttonColors[weatherCondition] || "#5964dc92",
    },
  };

  // 🔹 validar directamente aquí
  const handleValueChange = (value) => {
    setWeatherCondition(value);

    if (!value) {
      setWeatherError("Seleccionar condición climática");
    } else {
      setWeatherError("");
    }
  };

  return (
    <View style={styles.SegmentedButtonsContainer}>
      <SegmentedButtons
        value={weatherCondition}
        onValueChange={handleValueChange}
        style={styles.SegmentedButtons}
        theme={theme}
        buttons={[
          {
            value: "sol",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("sol", "weather-sunny", "Sol"),
          },
          {
            value: "noche",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("noche", "weather-night", "Noche"),
          },
          {
            value: "lluvia",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("lluvia", "weather-rainy", "Lluvia"),
          },
          {
            value: "rocío",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("rocío", "water", "Rocío"),
          },
          {
            value: "hielo",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("hielo", "snowflake", "Hielo"),
          },
        ]}
      />
      <Portal>
        {weatherError ? (
          <Text style={styles.errorText}>{weatherError}</Text>
        ) : null}
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  SegmentedButtons: {
    height: 60,
    justifyContent: "center",
  },
  SegmentedButtonsContainer: {
    //marginTop: 8,
  },
  errorText: {
    color: "rgba(216, 16, 16, 0.97)",
    fontSize: 18,
    fontWeight: "500",
    position: "absolute",
    top: 240,
    left: 18,
    textShadowColor: "#f6f6f6",
    textShadowOffset: 1,
    textShadowRadius: 1,
  },
});
