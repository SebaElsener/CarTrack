
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { deleteScan } from '../database/Database';

export default function ScanItem({ item }) {

  return (
    <View style={styles.card}>
      <Text style={styles.code}>{item.code}</Text>
        {item.area != null ? (
      <View style={styles.danosContainer}>
      <Text style={styles.items}>Fecha:
        {new Intl.DateTimeFormat('es-AR', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'America/Argentina/Buenos_Aires',
        }).format(new Date(item.date))}
      </Text>
      <Text>Area: {item.area}</Text>
      <Text>Avería: {item.averia}</Text>
      <Text>Gravedad: {item.grav}</Text>
      <Text>Observación: {item.obs}</Text>
      <Text>Código: {item.codigo}</Text>
      </View>
      ) : <Text></Text>
    }
      <View style={styles.buttonsContainer}>
        <View style={styles.syncedContainer}>
        <Text>Sincronizado: {item.synced === 0 ? "PENDIENTE" : "SI"}</Text>
        </View>
        <View style={styles.deleteContainer}>
        <IconButton style={styles.iconButton}
          size={40}
          icon= 'delete'
				  iconColor='rgba(133, 207, 189, 0.98)'
          onPress={() => deleteScan(item.id)}>
        </IconButton>
        </View>
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
    margin: 15,
    marginTop: 0,
    marginBottom: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  syncedContainer: {
    justifyContent: 'center',
  }
});