
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { deleteScan } from '../database/Database';

function ScanItem({ item, isActive }) {
  const pulseAnim = useRef(new Animated.Value(0)).current
  const loopRef = useRef(null)

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,0,0,0)', 'rgba(255,60,60,0.9)'],
  })

  const shadowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  })

  useEffect(() => {
    if (isActive) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      )
      loopRef.current.start()
    } else {
      loopRef.current?.stop()
      pulseAnim.setValue(0)
    }

    return () => loopRef.current?.stop()
  }, [isActive])

  return (
    <Animated.View
      style={[
        styles.card,
        isActive && {
          borderColor,
          shadowColor: 'red',
          shadowOpacity,
          shadowRadius: 10,
          elevation: 6,
        },
      ]}>
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
    </Animated.View>
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
    // backgroundColor: '#fff',
    // borderWidth: 2,
    // borderColor: 'transparent',
    // borderRadius: 12,
    // padding: 16,
    // marginVertical: 10,
    // shadowOffset: { width: 0, height: 0 },
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

export default memo(ScanItem)