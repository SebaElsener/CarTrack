import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
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
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function ConsultaDanoItem({ item }) {
  const position = useRef(new Animated.ValueXY()).current;
  const [index, setIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [pictsCurrentIndex, setPictsCurrentIndex] = useState(0);

  const damages = useMemo(
    () => (Array.isArray(item?.damages) ? item.damages : []),
    [item?.damages]
  );

  const fotos = useMemo(
    () => (Array.isArray(item?.fotos) ? item.fotos : []),
    [item?.fotos]
  );

  const current = useMemo(() => {
    if (damages.length === 0) return null;
    return damages[index % damages.length];
  }, [index, damages]);

  // Animación contador de card
  const cardCounterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cardCounterAnim.setValue(-20); // empieza fuera
    Animated.timing(cardCounterAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [index]);

  // Animación slide-in contador de fotos
  const photosCounterAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.timing(photosCounterAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [index, pictsCurrentIndex]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: {
              x: gesture.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
              y: 0,
            },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            position.setValue({ x: 0, y: 0 });
            setIndex((prev) => (prev + 1) % damages.length); // circular
            setPictsCurrentIndex(0); // reset fotos
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!current) return null;

  return (
    <>
      <View style={styles.wrapper}>
        {/* Contador de card animado */}
        <Animated.Text
          style={[
            styles.cardCounter,
            { transform: [{ translateY: cardCounterAnim }] },
          ]}
        >
          {index + 1} / {damages.length}
        </Animated.Text>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
        >
          <BlurView intensity={35} tint="light" style={styles.glass}>
            <Text style={styles.text}>
              Area:{" "}
              <Text style={{ fontWeight: 600 }}>
                ({current.area}) {current.area_desc}
              </Text>
            </Text>
            <Text style={styles.text}>
              Avería:{" "}
              <Text style={{ fontWeight: 600 }}>
                ({current.averia}) {current.averia_desc}
              </Text>
            </Text>
            <Text style={styles.text}>
              Gravedad:{" "}
              <Text style={{ fontWeight: 600 }}>
                ({current.grav}) {current.grav_desc}
              </Text>
            </Text>
            <Text style={styles.text}>
              Obs: <Text style={{ fontWeight: 600 }}> {current.obs}</Text>
            </Text>
            <Text style={styles.text}>
              Fecha:{" "}
              <Text style={{ fontWeight: 600 }}>
                {`${new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "America/Argentina/Buenos_Aires",
                }).format(new Date(current.date))}`}
              </Text>
            </Text>
          </BlurView>
        </Animated.View>
      </View>

      {/* Fotos */}
      {fotos.length > 0 && (
        <View style={styles.pictsContainer}>
          <BlurView intensity={35} tint="light" style={styles.glass}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {fotos.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setPictsCurrentIndex(idx);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri }} style={styles.image} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Animated.Text
              style={[
                styles.counter,
                { transform: [{ translateY: photosCounterAnim }] },
              ]}
            >
              {pictsCurrentIndex + 1} / {fotos.length}
            </Animated.Text>
          </BlurView>
        </View>
      )}

      {/* Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <ImageViewer
          imageUrls={fotos.map((uri) => ({ url: uri }))}
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
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 22,
    marginBottom: 20,
  },
  cardCounter: {
    position: "absolute",
    top: 8,
    right: 14,
    backgroundColor: "#12121250",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
    zIndex: 10,
    fontSize: 13,
  },
  card: {
    width: "100%",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  glass: {
    padding: 18,
    borderRadius: 22,
    overflow: "hidden",
  },
  text: {
    fontSize: 15,
    marginBottom: 6,
    color: "#222",
  },
  counter: {
    marginTop: 10,
    textAlign: "center",
    fontWeight: "700",
  },
  pictsContainer: {
    marginTop: 20,
    height: 150,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 6,
  },
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
