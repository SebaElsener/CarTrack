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
  const [modalVisible, setModalVisible] = useState(false);
  const [pictsCurrentIndex, setPictsCurrentIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);

  // Animated values
  const positions = useRef(damages.map(() => new Animated.ValueXY())).current;
  const scaleAnims = useRef(damages.map(() => new Animated.Value(0.9))).current;
  const fadeAnims = useRef(damages.map(() => new Animated.Value(0))).current;

  // Animación de aparición
  useEffect(() => {
    const animations = damages.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 300,
          delay: i * 100,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnims[i], {
          toValue: 1,
          friction: 6,
          useNativeDriver: false,
          delay: i * 100,
        }),
      ])
    );
    Animated.stagger(50, animations).start();
  }, [damages]);

  // Reset de card
  const resetCard = (i) => {
    Animated.spring(positions[i], {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  // PanResponder
  const panResponders = damages.map((_, i) =>
    PanResponder.create({
      onMoveShouldSetPanResponder: () => i === topIndex,
      onPanResponderMove: (_, gesture) => {
        positions[i].setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120 || gesture.dx < -120) {
          const direction =
            gesture.dx > 0 ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
          Animated.timing(positions[i], {
            toValue: { x: direction, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            // Subir stack
            if (topIndex < damages.length - 1) {
              // Animar card siguiente ligeramente hacia arriba
              Animated.parallel([
                Animated.spring(scaleAnims[topIndex + 1], {
                  toValue: 1,
                  friction: 5,
                  useNativeDriver: false,
                }),
                Animated.timing(fadeAnims[topIndex + 1], {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: false,
                }),
              ]).start();
              setTopIndex(topIndex + 1);
            }
          });
        } else {
          resetCard(i);
        }
      },
    })
  );

  const modalImages = fotos.map((uri) => ({ url: uri }));

  return (
    <View style={styles.card}>
      <View style={styles.carouselContainer}>
        {damages
          .map((damage, i) => {
            const pan = positions[i];
            const rotate = pan.x.interpolate({
              inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
              outputRange: ["-10deg", "0deg", "10deg"],
              extrapolate: "clamp",
            });

            const scale = scaleAnims[i];
            const opacity = fadeAnims[i];

            return (
              <Animated.View
                key={damage.id}
                {...panResponders[i].panHandlers}
                style={[
                  styles.tinderCard,
                  {
                    transform: [
                      ...pan.getTranslateTransform(),
                      { rotate },
                      { scale },
                    ],
                    opacity,
                    zIndex: damages.length - i,
                  },
                ]}
              >
                <Text style={styles.items}>
                  {`Fecha: ${new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "America/Argentina/Buenos_Aires",
                  }).format(new Date(damage.date))}`}
                </Text>
                <Text style={styles.items}>Área: {damage.area}</Text>
                <Text style={styles.items}>Avería: {damage.averia}</Text>
                <Text style={styles.items}>Gravedad: {damage.grav}</Text>
                <Text style={styles.items}>Obs: {damage.obs}</Text>
                <Text style={styles.items}>Código: {damage.codigo}</Text>
              </Animated.View>
            );
          })
          .reverse()}
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
  card: {
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#dcdcdcf9",
    borderRadius: 4,
  },
  carouselContainer: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  tinderCard: {
    position: "absolute",
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
  },
  items: {
    padding: 3,
    fontSize: 15,
    color: "#3b3b3be6",
  },
  counter: {
    marginTop: 5,
    textAlign: "center",
    fontWeight: "bold",
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
