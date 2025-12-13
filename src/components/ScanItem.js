
import { Button, StyleSheet, Text, View } from 'react-native';
import { deleteScan } from '../database/Database';
//import { Button } from '@rneui/themed'

export default function ScanItem({ item }) {

  return (
    <View style={styles.card}>
      <Text style={styles.code}>{item.code}</Text>
        {item.area != null ? (
      <View style={styles.danosContainer}>
      <Text>Tipo: {item.type}</Text>
      <Text>Fecha: {item.date}</Text>
      <Text>Area: {item.area}</Text>
      <Text>Avería: {item.averia}</Text>
      <Text>Gravedad: {item.grav}</Text>
      <Text>Observación: {item.obs}</Text>
      <Text>Código: {item.codigo}</Text>
      </View>
      ) : <Text></Text>
    }
      <View style={styles.buttonsContainer}>
        <Text>Sincronizado: {item.synced === 0 ? "PENDIENTE" : "SI"}</Text>
        <Button title="Eliminar" buttonStyle={{backgroundColor: 'rgba(52, 49, 49, 0.12)', marginTop: 10}} onPress={() => deleteScan(item.id)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#86b2aa20",
    borderColor: '#666a6a71',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  code: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 23
  },
  danosContainer: {
    margin: 15
  },
  buttonsContainer: {
    margin: 15
  }
});