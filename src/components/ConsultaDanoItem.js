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
  console.log(item);
  const [modalVisible, setModalVisible] = useState(false);
  const [pictsCurrentIndex, setPictsCurrentIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Animaciones por daño
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (damages.length > 0) {
      fadeAnim.setValue(0);
      translateAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [damages]);

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
    setCurrentIndex(index);
  };

  const modalImages = fotos.map((uri) => ({ url: uri }));

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
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
        {damages.map((damage) => (
          <View
            key={damage.id}
            style={[styles.damageCard, { width: containerWidth }]}
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
          </View>
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

// ✅ Memoizamos para que no se re-renderice innecesariamente
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
