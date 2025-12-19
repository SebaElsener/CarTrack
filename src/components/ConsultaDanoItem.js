import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';

export default function ConsultaDanoItem({ item }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fotos = item.fotos || [];
  const images = fotos.map(f => ({ url: f.pictureurl }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>VIN: {item.vin}</Text>
      <Text style={styles.items}>Fecha:
        {new Intl.DateTimeFormat('es-AR', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'America/Argentina/Buenos_Aires',
        }).format(new Date(item.fecha))}
      </Text>      
      <Text style={styles.items}>Area: {item.area}</Text>
      <Text style={styles.items}>Avería: {item.averia}</Text>
      <Text style={styles.items}>Gravedad: {item.gravedad}</Text>
      <Text style={styles.items}>Observación: {item.observaciones}</Text>
      <Text style={styles.items}>Código: {item.codigo}</Text>

      {fotos.length > 0 && (
        <View style={{ marginTop: 20, marginBottom: 10 }}>
          <FlatList
            data={fotos}
            horizontal
            keyExtractor={(f, idx) => f.id?.toString() || idx.toString()}
            renderItem={({ item: foto, index }) => (
              <TouchableOpacity onPress={() => { setCurrentIndex(index); setModalVisible(true); }}>
                <Image source={{ uri: foto.pictureurl }} style={styles.image} />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
          <Text style={styles.counter}>{currentIndex + 1} / {fotos.length}</Text>
        </View>
      )}

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
          onChange={index => setCurrentIndex(index)}
          saveToLocalByLongPress={false}
          renderIndicator={(current, total) => (
            <Text style={styles.modalCounter}>{current} / {total}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 17, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  image: { width: 100, height: 100, marginRight: 8, borderRadius: 6 },
  counter: { marginTop: 5, textAlign: 'center', fontWeight: 'bold' },
  modal: { margin: 0 },
  modalCounter: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
  },
  items: {
    padding: 3,
    fontSize: 15
  }
})