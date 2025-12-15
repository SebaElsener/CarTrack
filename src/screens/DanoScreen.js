
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Areas from '../components/Areas';
import { addInfo, getScan } from '../database/Database';
import areas from '../utils/areas.json' with { type: 'json' };

export default function DanoScreen({ navigation, route }) {

  const vin = route.params.lastResult

  const [area, setArea] = useState("")
  const [averia, setAveria] = useState("")
  const [grav, setGrav] = useState("")
  const [obs, setObs] = useState("")
  const [codigo, setCodigo] = useState("")

  /////////////////////////////////

  const areasDropdown = areas.map(p => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id,          // 👈 lo que se guarda
  }))

  ////////////////////////////////

  const getPreexistingDamages = async () => {
    const result = await getScan(vin)
    setArea(result[0].area)
    setAveria(result[0].averia)
    setGrav(result[0].grav)
    setObs(result[0].obs)
    setCodigo(result[0].codigo)
  }

    useEffect(() => {
      getPreexistingDamages();
    }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.code}>{vin}</Text>
      <View>
      <Areas
        areas={areasDropdown}
        selectedValue={area}
        onSelect={(item) => setArea(item.value)}
      />
      </View>
      {/* <TextInput
        value={area}
        placeholder="Area"
        onChangeText={text => setArea(text)}
      />

      <TextInput
        value={averia}
        placeholder="Avería"
        onChangeText={text => setAveria(text)}
      />
      <TextInput
        value={grav}
        placeholder="Gravedad"
        onChangeText={text => setGrav(text)}
      />
      <TextInput
        value={obs}
        placeholder="Observación"
        onChangeText={text => setObs(text)}
      />
      <TextInput
        value={codigo}
        placeholder="Código"
        onChangeText={text => setCodigo(text)}
      /> */}
      <View style={styles.buttonContainer}>
      <Button
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='elevated'
				buttonColor='rgba(125, 200, 181, 0.88)'
				textColor='rgba(41, 30, 30, 0.89)'
        onPress={() => updateInfo(vin, area, averia, grav, obs, codigo)}>
        GUARDAR
      </Button>
      </View>
      <View style={styles.buttonContainer}>
      <Button
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='elevated'
				buttonColor='rgba(125, 200, 181, 0.88)'
				textColor='rgba(41, 30, 30, 0.89)'
        onPress={() => navigation.navigate("Escanear")}>
        VOLVER
      </Button>
      </View>
    </View>
  );
}

const updateInfo = async (vin, area, averia, grav, obs, codigo)=> {
  let result = await addInfo(vin, area, averia, grav, obs, codigo)
  if (result === 'Información actualizada')
      Alert.alert("ACTUALIZADO OK! => ", vin, [
        {
          text: 'ACEPTAR',
          style: 'default',
        }
      ])
    else {
      Alert.alert("ERROR AL ACTUALIZAR: ", result, [
        {
          text: 'ACEPTAR',
          style: 'default',
        }
      ])
    }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 15,
    marginBottom: 10,
    borderRadius: 6
  },
  code: {
    fontWeight: 'bold',
    fontSize: 23,
    color: "#312f2fce",
    margin: 20,
    marginBottom: 30
  },
  buttonContainer: {
    marginTop: 30
  }
});