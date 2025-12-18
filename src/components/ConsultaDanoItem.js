
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ConsultaDanoItem({ item }) {

  return (
    <View style={styles.card}>
      <Text style={styles.code}>{item.code}</Text>
      <View style={styles.danosContainer}>
      <Text>Fecha: {item.date}</Text>
      <Text>Area: {item.area}</Text>
      <Text>Avería: {item.averia}</Text>
      <Text>Gravedad: {item.grav}</Text>
      <Text>Observación: {item.obs}</Text>
      <Text>Código: {item.codigo}</Text>
      </View>

      {item.pictures.length > 0 && (
  <FlatList
    data={item.pictures}
    //horizontal
    keyExtractor={(foto, index) =>
      foto.id ? foto.id.toString() : index.toString()
    }
    renderItem={({ item }) => (
      <Image
        source={{ uri: item.pictureurl }}
        style={{ width: 80, height: 80, marginRight: 8 }}
      />
    )}
  />
)}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#86b2aa20",
    borderColor: '#666a6a71',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
  },
  code: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20
  },
  danosContainer: {
    margin: 10
  }
});