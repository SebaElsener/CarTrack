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

const SCREEN_WIDTH = Dimensions.get("window").width;

function ConsultaDanoItem({ item }) {
  const { damages = [], fotos = [] } = item;
  const [topIndex, setTopIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [pictsCurrentIndex, setPictsCurrentIndex] = useState(0);

  const position = useRef(new Animated.ValueXY()).current;
  const topScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(0.95)).current;
  const nextOpacity = useRef(new Animated.Value(0.7)).current;

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
        const progress = Math.min(Math.abs(gesture.dx) / 120, 1);
        nextScale.setValue(0.95 + 0.05 * progress);
        nextOpacity.setValue(0.7 + 0.3 * progress);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > 120) {
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
    })
  ).current;

  const modalImages = fotos.map((uri) => ({ url: uri }));
  const topDamage = damages[topIndex];
  const nextDamage = damages[(topIndex + 1) % damages.length];

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
              }
            ).format(new Date(nextDamage.date))}`}</Text>
            <Text style={styles.items}>Área: {nextDamage.area}</Text>
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
                transform: [
                  ...position.getTranslateTransform(),
                  {
                    rotate: position.x.interpolate({
                      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                      outputRange: ["-10deg", "0deg", "10deg"],
                      extrapolate: "clamp",
                    }),
                  },
                  { scale: topScale },
                ],
                opacity: 1,
                zIndex: 1,
              },
            ]}
          >
            <Text style={styles.items}>{`Fecha: ${new Intl.DateTimeFormat(
              "es-AR",
              {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: "America/Argentina/Buenos_Aires",
              }
            ).format(new Date(topDamage.date))}`}</Text>
            <Text style={styles.items}>Área: {topDamage.area}</Text>
            <Text style={styles.items}>Avería: {topDamage.averia}</Text>
            <Text style={styles.items}>Gravedad: {topDamage.grav}</Text>
            <Text style={styles.items}>Obs: {topDamage.obs}</Text>
            <Text style={styles.items}>Código: {topDamage.codigo}</Text>
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
          renderIndicator={(current, total) => (
            <Text style={styles.modalCounter}>
              {current} / {total}
            </Text>
          )}
        />
      </Modal>
    </View>
  );
}

export default memo(ConsultaDanoItem);

const styles = StyleSheet.create({
  card: { padding: 10, marginBottom: 15, borderRadius: 4 },
  carouselContainer: {
    width: "100%",
    height: 210,
    justifyContent: "center",
    alignItems: "center",
  },
  tinderCard: {
    position: "absolute",
    width: "100%",
    padding: 10,
    backgroundColor: "#f4f1f1ff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#c5c1c1ff",
  },
  items: { padding: 3, fontSize: 15, color: "#3b3b3be6" },
  counter: { marginTop: 5, textAlign: "center", fontWeight: "bold" },
  image: { width: 100, height: 100, marginRight: 8, borderRadius: 6 },
  modal: { margin: 0 },
  modalCounter: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    position: "absolute",
    top: 50,
    alignSelf: "center",
  },
});
