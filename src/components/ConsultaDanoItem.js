import { useRef, useState } from "react";
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

export default function ConsultaDanoItem({ item }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;

  const fotos = item.fotos || [];
  const images = fotos.map((f) => ({ url: f.pictureurl }));

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
    setCurrentIndex(index);
  };

  return (
    <View
      style={styles.card}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Fecha */}
      <Text style={styles.items}>
        {`Fecha: ${new Intl.DateTimeFormat("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Argentina/Buenos_Aires",
        }).format(new Date(item.date))}`}
      </Text>

      {/* Scroll horizontal de daños */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={true}
        onMomentumScrollEnd={onMomentumScrollEnd}
        snapToInterval={containerWidth}
        decelerationRate="fast"
      >
        {item.damages.map((damage) => (
          <View
            key={damage.id}
            style={[styles.damageCard, { width: containerWidth }]}
          >
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
        {currentIndex + 1} / {item.damages.length}
      </Text>

      {/* Fotos */}
      {fotos.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {fotos.map((foto, index) => (
              <TouchableOpacity
                key={foto.id ?? index}
                onPress={() => {
                  setCurrentIndex(index);
                  setModalVisible(true);
                }}
              >
                <Image source={{ uri: foto.pictureurl }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.counter}>
            {currentIndex + 1} / {fotos.length}
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
          imageUrls={images}
          index={currentIndex}
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

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#dcdcdcf9",
    borderRadius: 4,
  },
  damageCard: {
    marginTop: 10,
    //marginBottom: 10,
    minHeight: 160,
    maxHeight: 160,
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
