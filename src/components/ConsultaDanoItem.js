
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ConsultaDanoItem({ item }) {

  console.log("Rendering ConsultaDanoItem with item:", item);

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