import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import GlassAnimatedCard from "../components/GlassAnimatedCard";
import { useToast } from "../components/ToastProvider";
import { deleteTable, hasPendingData } from "../database/Database";
import { requestSync } from "../services/syncTrigger";

export default function HomeScreen() {
  const [deleting, setDeleting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { showToast } = useToast();

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
    try {
      setDeleting(true);

      const hasPending = await hasPendingData();

      if (hasPending) {
        showToast(
          "Hay datos pendientes. Sincronizando antes comenzar nueva colección...",
          "info",
        );

        requestSync();

        return;
      }

      await deleteTable();

      showToast("Nueva colección iniciada correctamente", "success");
    } catch (error) {
      console.log(error);
      showToast("Error al inicar nueva colección", "error");
    } finally {
      setDeleting(false);
    }
  };

  const cards = [
    {
      title: "Registrar carga",
      description: "Carga de unidades en origen",
      href: "/(app)/ScannerScreen?movimiento=CARGA",
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
      href: "/(app)/ScannerScreen?movimiento=DESCARGA",
      backgroundColor: "rgba(64, 74, 165, 0.38)",
      icon: (
        <MaterialCommunityIcons
          name="car-arrow-right"
          size={100}
          color="#2a2a2acb"
        />
      ),
    },
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
      <View style={styles.deleteTable}>
        <Button
          //style={styles.deleteTable}
          onPress={() => setConfirmVisible(true)}
          loading={deleting}
          disabled={deleting}
        >
          {deleting ? "INICIANDO NUEVA COLECCION..." : "NUEVA COLECCION"}
        </Button>
      </View>

      {deleting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
          <Text style={{ color: "white", fontWeight: 600, fontSize: 20 }}>
            Nueva colección...
          </Text>
        </View>
      )}

      <Portal>
        <Dialog
          visible={confirmVisible}
          onDismiss={() => setConfirmVisible(false)}
        >
          <Dialog.Title>Confirmar</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">¿COMENZAR NUEVA COLECCION?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancelar</Button>
            <Button
              onPress={async () => {
                setConfirmVisible(false);
                await handleDeleteDatabase();
              }}
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginTop: 30,
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
    bottom: 0,
    left: 20,
  },
  overlay: {
    position: "absolute",
    top: 190,
    width: 250,
    height: 200,
    left: 60,
    //right: 0,
    //bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.87)",
    zIndex: 999999,
  },
});
