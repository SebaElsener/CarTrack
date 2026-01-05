import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Icon, SegmentedButtons, Text } from "react-native-paper";
import { useScans } from "../context/ScanContext";

export default function WeatherCondition() {
  const { weatherCondition, setWeatherCondition } = useScans();
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
          style={{
            transform: [{ scale: active ? scaleAnim : 1 }],
          }}
        >
          <Icon source={icon} size={22} color="#eeeeeeff" />
        </Animated.View>

        <Text
          variant="labelSmall"
          style={{ fontSize: 11, textAlign: "center", color: "#eeeeeeff" }}
        >
          {label}
        </Text>
      </View>
    );
  };

  // 🔹 colores de fondo por botón seleccionado
  const buttonColors = {
    sunny: "#FFC10755",
    night: "#673AB755",
    rain: "#2196F355",
    dew: "#00BCD455",
    frost: "#b0ecf474",
  };

  // 🔹 aplicar color de fondo dinámico al botón activo
  const theme = {
    colors: {
      secondaryContainer: buttonColors[weatherCondition] || "#5964dc92",
    },
  };

  return (
    <View style={styles.SegmentedButtonsContainer}>
      <SegmentedButtons
        value={weatherCondition}
        onValueChange={setWeatherCondition}
        style={styles.SegmentedButtons}
        theme={theme} // 🔹 aquí aplicamos el color dinámico
        buttons={[
          {
            value: "sunny",
            style: {
              borderColor: "#eeeeeeff",
              borderWidth: 0.4,
            },
            label: renderLabel("sunny", "weather-sunny", "Sol"),
          },
          {
            value: "night",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("night", "weather-night", "Noche"),
          },
          {
            value: "rain",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("rain", "weather-rainy", "Lluvia"),
          },
          {
            value: "dew",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("dew", "water", "Rocío"),
          },
          {
            value: "frost",
            style: { borderColor: "#eeeeeeff", borderWidth: 0.4 },
            label: renderLabel("frost", "snowflake", "Hielo"),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  SegmentedButtons: {
    height: 60,
    justifyContent: "center",
  },
  SegmentedButtonsContainer: {},
});
