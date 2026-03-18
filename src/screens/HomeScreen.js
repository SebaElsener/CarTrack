import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import GlassAnimatedCard from "../components/GlassAnimatedCard";
import { deleteTable } from "../database/Database";

export default function HomeScreen() {
  const animations = useRef(
    Array.from({ length: 6 }).map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    })),
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
            ]),
          ),
        );

      Animated.sequence([
        animateRow([0, 1]),
        Animated.delay(120),
        animateRow([2, 3]),
        Animated.delay(120),
        animateRow([4, 5]),
      ]).start();
    }, [animations]),
  );

  const handleDeleteDatabase = async () => {
    await deleteTable(); // SQLite (DROP + CREATE)
  };

  const cards = [
    {
      title: "Registrar carga",
      description: "Carga de unidades en origen",
      href: "/(app)/ScannerScreen",
      backgroundColor: "rgba(103, 205, 83, 0.4)",
      icon: (
        <MaterialCommunityIcons
          name="car-arrow-left"
          size={100}
          color="#2a2a2acb"
        />
      ),
    },
    {
      title: "Registrar descarga",
      description: "Descarga de unidades en destino",
      href: "/(app)/ScannerScreen",
      backgroundColor: "rgba(64, 74, 165, 0.38)",
      icon: (
        <MaterialCommunityIcons
          name="car-arrow-right"
          size={100}
          color="#2a2a2acb"
        />
      ),
    },
    // {
    //   title: "Reset",
    //   description: "Eliminar tablas locales",
    //   backgroundColor: "rgba(206, 104, 104, 0.38)",
    //   icon: (
    //     <MaterialCommunityIcons name="delete" size={55} color="#2a2a2acb" />
    //   ),
    //   onPress: handleDeleteDatabase,
    // },
  ];

  return (
    <View style={styles.backContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Car<Text style={styles.titleSpan}>Pointer</Text>
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
      <View>
        <Button style={styles.deleteTable} onPress={() => handleDeleteDatabase}>
          ELIMINAR TABLA
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    //paddingHorizontal: 20,
    //paddingTop: 20,
  },
  title: { fontSize: 28, color: "rgba(70, 45, 45, 0.84)", fontWeight: "bold" },
  titleContainer: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
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
    flexDirection: "column",
    //flexWrap: "wrap",
    //justifyContent: "space-around",
    rowGap: 40,
    width: "85%",
    flex: 1,
    //marginTop: 30,
  },
  cardWrapper: {
    //flexBasis: "60%", // dos por fila
    //height: 500,
    //aspectRatio: 1, // cuadrada
  },
  deleteTable: {
    position: "absolute",
    bottom: 50,
    left: 30,
  },
});
