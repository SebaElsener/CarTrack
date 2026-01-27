import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Modal from "react-native-modal";
import { Button, Dialog, Portal } from "react-native-paper";

const SCREEN_WIDTH = Dimensions.get("window").width;

function ConsultaDanoItem({ item, onDeleteDamage, onUndoDelete }) {
  const { damages = [], fotos = [] } = item;

  const [topIndex, setTopIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [pictsCurrentIndex, setPictsCurrentIndex] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const pendingDelete = useRef(null);

  const position = useRef(new Animated.ValueXY()).current;
  const topScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(0.95)).current;
  const nextOpacity = useRef(new Animated.Value(0.7)).current;

  const deleteOpacity = useRef(new Animated.Value(1)).current;
  const deleteTranslate = useRef(new Animated.Value(0)).current;

  /** Inicializar animaciones nextDamage */
  useEffect(() => {
    Animated.parallel([
      Animated.spring(nextScale, {
        toValue: 0.95,
        friction: 6,
        useNativeDriver: false,
      }),
      Animated.timing(nextOpacity, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  /** PanResponder (swipe bloqueable mientras borra) */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isDeleting && Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        if (isDeleting) return;
        position.setValue({ x: gesture.dx, y: 0 });
        const progress = Math.min(Math.abs(gesture.dx) / 120, 1);
        nextScale.setValue(0.95 + 0.05 * progress);
        nextOpacity.setValue(0.7 + 0.3 * progress);
      },
      onPanResponderRelease: (_, gesture) => {
        if (isDeleting) return;
        if (Math.abs(gesture.dx) > 120 && damages.length > 1) {
          const direction =
            gesture.dx > 0 ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
          Animated.timing(position, {
            toValue: { x: direction, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setTopIndex((prev) => (prev + 1) % damages.length);
            position.setValue({ x: 0, y: 0 });
            topScale.setValue(1);
            nextOpacity.setValue(0.7);
            nextScale.setValue(0.85);
            Animated.spring(nextScale, {
              toValue: 0.95,
              friction: 6,
              useNativeDriver: false,
            }).start();
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          Animated.parallel([
            Animated.spring(nextScale, {
              toValue: 0.95,
              friction: 6,
              useNativeDriver: false,
            }),
            Animated.timing(nextOpacity, {
              toValue: 0.7,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  /** Confirm delete */
  const confirmDelete = () => {
    pendingDelete.current = damages[topIndex];
    setConfirmVisible(true);
  };

  const executeDelete = () => {
    setConfirmVisible(false);
    setIsDeleting(true);

    Animated.parallel([
      Animated.timing(deleteOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(deleteTranslate, {
        toValue: -40,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onDeleteDamage?.(pendingDelete.current);
      setTopIndex((prev) => Math.max(0, prev - 1));
      setIsDeleting(false);
      deleteOpacity.setValue(1);
      deleteTranslate.setValue(0);
      setTopIndex(0);
    });
  };

  const modalImages = fotos.map((uri) => ({ url: uri }));
  const topDamage = damages[topIndex];
  const nextDamage =
    damages.length > 1 ? damages[(topIndex + 1) % damages.length] : null;

  if (!topDamage) return null;

  return (
    <View style={styles.card}>
      <View style={styles.carouselContainer}>
        {nextDamage && (
          <Animated.View
            style={[
              styles.tinderCard,
              {
                transform: [{ scale: nextScale }],
                opacity: nextOpacity,
                zIndex: 0,
              },
            ]}
          >
            <Text style={styles.items}>{`Fecha: ${new Intl.DateTimeFormat(
              "es-AR",
              {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: "America/Argentina/Buenos_Aires",
              },
            ).format(new Date(nextDamage.date))}`}</Text>
            <Text style={styles.items}>Area: {nextDamage.area}</Text>
            <Text style={styles.items}>Avería: {nextDamage.averia}</Text>
            <Text style={styles.items}>Gravedad: {nextDamage.grav}</Text>
            <Text style={styles.items}>Obs: {nextDamage.obs}</Text>
            <Text style={styles.items}>Código: {nextDamage.codigo}</Text>
          </Animated.View>
        )}

        {topDamage && (
          <Animated.View
            key={topIndex}
            {...panResponder.panHandlers}
            style={[
              styles.tinderCard,
              {
                opacity: deleteOpacity,
                transform: [
                  ...position.getTranslateTransform(),
                  { translateY: deleteTranslate },
                ],
                zIndex: 1,
              },
            ]}
          >
            <Text style={styles.items}>
              Fecha:{" "}
              <Text style={{ fontWeight: 600 }}>
                {`${new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "America/Argentina/Buenos_Aires",
                }).format(new Date(topDamage.date))}`}
              </Text>
            </Text>
            <Text style={styles.items}>
              Area:{" "}
              <Text style={{ fontWeight: 600 }}>
                ({topDamage.area}) {topDamage.area_desc}
              </Text>
            </Text>
            <Text style={styles.items}>
              Avería:{" "}
              <Text style={{ fontWeight: 600 }}>
                ({topDamage.averia}) {topDamage.averia_desc}
              </Text>
            </Text>
            <Text style={styles.items}>
              Gravedad:{" "}
              <Text style={{ fontWeight: 600 }}>
                ({topDamage.grav}) {topDamage.grav_desc}
              </Text>
            </Text>
            <Text style={styles.items}>
              Obs: <Text style={{ fontWeight: 600 }}>{topDamage.obs}</Text>
            </Text>
            <Button
              mode="contained-tonal"
              onPress={confirmDelete}
              style={{ marginTop: 8 }}
              labelStyle={{ color: "#403d3de7" }}
            >
              Eliminar daño
            </Button>
          </Animated.View>
        )}
      </View>

      <Text style={styles.counter}>
        {topIndex + 1} / {damages.length}
      </Text>

      {fotos.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {fotos.map((foto, index) => (
              <TouchableOpacity
                key={foto.id ?? index}
                onPress={() => {
                  setPictsCurrentIndex(index);
                  setModalVisible(true);
                }}
              >
                <Image source={{ uri: foto }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.counter}>
            {pictsCurrentIndex + 1} / {fotos.length}
          </Text>
        </View>
      )}

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <ImageViewer
          imageUrls={modalImages}
          index={pictsCurrentIndex}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
          saveToLocalByLongPress={false}
        />
      </Modal>

      <Portal>
        <Dialog
          visible={confirmVisible}
          onDismiss={() => setConfirmVisible(false)}
        >
          <Dialog.Title>¿Eliminar daño?</Dialog.Title>
          <Dialog.Content>
            <Text>Esta acción no se puede deshacer.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancelar</Button>
            <Button onPress={executeDelete}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

export default memo(ConsultaDanoItem);

const styles = StyleSheet.create({
  card: { padding: 5, marginBottom: 15, borderRadius: 4 },
  carouselContainer: {
    width: "100%",
    height: 235,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  tinderCard: {
    position: "absolute",
    width: "100%",
    padding: 10,
    backgroundColor: "#f4f1f1ff",
    borderRadius: 10,
  },
  items: { padding: 3, fontSize: 15, color: "#2a2a2ae6" },
  counter: {
    //marginTop: 3,
    textAlign: "center",
    fontWeight: "bold",
    color: "#262626b1",
  },
  image: { width: 100, height: 100, marginRight: 8, borderRadius: 6 },
  modal: { margin: 0 },
});
