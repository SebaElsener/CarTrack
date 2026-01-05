import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import GlassAnimatedCard from "../components/GlassAnimatedCard";
import { deleteTable } from "../database/Database";

export default function HomeScreen() {
  const animations = useRef(
    Array.from({ length: 4 }).map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  useFocusEffect(
    useCallback(() => {
      animations.forEach((a) => {
        a.opacity.setValue(0);
        a.translateY.setValue(20);
      });

      const animateRow = (indexes) =>
        Animated.parallel(
          indexes.map((i) =>
            Animated.parallel([
              Animated.timing(animations[i].opacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
              }),
              Animated.timing(animations[i].translateY, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
              }),
            ])
          )
        );

      Animated.sequence([
        animateRow([0, 1]), // 🟩 fila superior
        Animated.delay(120),
        animateRow([2, 3]), // 🟦 fila inferior
      ]).start();
    }, [animations])
  );

  const cards = [
    {
      title: "Escanear VIN",
      description: "Escaneo del código VIN",
      href: "/(app)/ScannerScreen",
      backgroundColor: "rgba(126, 249, 128, 0.28)",
      icon: (
        <MaterialCommunityIcons
          name="barcode-scan"
          size={55}
          color="#2a2a2aba"
        />
      ),
    },
    {
      title: "Historial",
      description: "Vehículos escaneados",
      href: "/(app)/HistoryScreen",
      backgroundColor: "rgba(143, 156, 143, 0.38)",
      icon: (
        <MaterialCommunityIcons
          name="clipboard-list-outline"
          size={55}
          color="#2a2a2acb"
        />
      ),
    },
    {
      title: "Daños",
      description: "Consulta de daños previos",
      href: "/(app)/ConsultaDanoScreen",
      backgroundColor: "rgba(91, 116, 179, 0.38)",
      icon: (
        <MaterialCommunityIcons name="car-wrench" size={55} color="#2a2a2acb" />
      ),
    },
    {
      title: "Reset",
      description: "Eliminar tablas locales",
      backgroundColor: "rgba(206, 104, 104, 0.38)",
      icon: (
        <MaterialCommunityIcons name="delete" size={55} color="#2a2a2acb" />
      ),
      onPress: deleteTable,
    },
  ];

  return (
    <View style={styles.backContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Car<Text style={styles.titleSpan}>Track</Text>
        </Text>
      </View>
      <View style={styles.container}>
        <View style={styles.grid}>
          {cards.map((card, index) => (
            <Animated.View
              key={card.title}
              style={[
                styles.cardWrapper,
                {
                  opacity: animations[index].opacity,
                  transform: [{ translateY: animations[index].translateY }],
                },
              ]}
            >
              <GlassAnimatedCard {...card} />
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    //paddingTop: 20,
  },
  title: { fontSize: 38, color: "rgba(70, 45, 45, 0.84)", fontWeight: "bold" },
  titleContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  titleSpan: {
    fontStyle: "italic",
    color: "rgba(214, 53, 53, 0.8)",
  },
  backImage: {
    flex: 1,
    width: null,
    height: null,
  },
  backContainer: {
    //minHeight: "100%",
    flex: 1,
  },
  button: {
    padding: 8,
    width: 300,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    width: "100%",
    flex: 1,
    marginTop: 40,
  },
  cardWrapper: {
    width: "48%", // dos por fila
    aspectRatio: 1, // cuadrada
  },
});
