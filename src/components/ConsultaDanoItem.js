import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Modal from "react-native-modal";

function ConsultaDanoItem({ item }) {
  const { damages = [], fotos = [] } = item;
  const [modalVisible, setModalVisible] = useState(false);
  const [pictsCurrentIndex, setPictsCurrentIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Animación principal del card
  const fadeAnimCard = useRef(new Animated.Value(0)).current;
  const translateAnimCard = useRef(new Animated.Value(20)).current;

  // Animaciones para cada daño
  const damageAnimations = useRef(
    damages.map(() => ({
      fade: new Animated.Value(0),
      translate: new Animated.Value(20),
    }))
  ).current;

  // Animaciones para cada foto
  const photoAnimations = useRef(
    fotos.map(() => ({
      fade: new Animated.Value(0),
      translate: new Animated.Value(20),
    }))
  ).current;

  // Animar card completo
  useEffect(() => {
    fadeAnimCard.setValue(0);
    translateAnimCard.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnimCard, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnimCard, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animación secuencial de cada daño
  useEffect(() => {
    const animations = damages.map((_, i) =>
      Animated.parallel([
        Animated.timing(damageAnimations[i].fade, {
          toValue: 1,
          duration: 300,
          delay: i * 100,
          useNativeDriver: true,
        }),
        Animated.timing(damageAnimations[i].translate, {
          toValue: 0,
          duration: 300,
          delay: i * 100,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(50, animations).start();
  }, [damages]);

  // Animación secuencial de cada foto
  useEffect(() => {
    const animations = fotos.map((_, i) =>
      Animated.parallel([
        Animated.timing(photoAnimations[i].fade, {
          toValue: 1,
          duration: 300,
          delay: i * 100,
          useNativeDriver: true,
        }),
        Animated.timing(photoAnimations[i].translate, {
          toValue: 0,
          duration: 300,
          delay: i * 100,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(50, animations).start();
  }, [fotos]);

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
    setCurrentIndex(index);
  };

  const modalImages = fotos.map((uri) => ({ url: uri }));

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnimCard,
          transform: [{ translateY: translateAnimCard }],
        },
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Scroll horizontal de daños */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={true}
        onMomentumScrollEnd={onMomentumScrollEnd}
        snapToInterval={containerWidth}
        decelerationRate="fast"
      >
        {damages.map((damage, i) => (
          <Animated.View
            key={damage.id}
            style={[
              styles.damageCard,
              { width: containerWidth },
              {
                opacity: damageAnimations[i].fade,
                transform: [{ translateY: damageAnimations[i].translate }],
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
        ))}
      </ScrollView>

      {/* Indicador de daño */}
      <Text style={styles.counter}>
        {currentIndex + 1} / {damages.length}
      </Text>

      {/* Fotos */}
      {fotos.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {fotos.map((foto, i) => (
              <Animated.View
                key={foto.id ?? i}
                style={{
                  opacity: photoAnimations[i].fade,
                  transform: [{ translateY: photoAnimations[i].translate }],
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setPictsCurrentIndex(i);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri: foto }} style={styles.image} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
          <Text style={styles.counter}>
            {pictsCurrentIndex + 1} / {fotos.length}
          </Text>
        </View>
      )}

      {/* Modal fotos */}
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
    </Animated.View>
  );
}

// Memoizamos para optimizar render
export default memo(ConsultaDanoItem);

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#dcdcdcf9",
    borderRadius: 4,
  },
  damageCard: {
    marginTop: 10,
    minHeight: 160,
    maxHeight: 180,
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
