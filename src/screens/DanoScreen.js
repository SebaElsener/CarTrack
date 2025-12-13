
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { addInfo, getScan } from '../database/Database';
//import { Button } from '@rneui/themed'

export default function DanoScreen({ navigation, route }) {

  const vin = route.params.lastResult

  const [area, setArea] = useState("")
  const [averia, setAveria] = useState("")
  const [grav, setGrav] = useState("")
  const [obs, setObs] = useState("")
  const [codigo, setCodigo] = useState("")

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
      <TextInput
        value={area}
        placeholder="Area: "
        onChangeText={text => setArea(text)}
      />
      <TextInput
        value={averia}
        placeholder="Avería: "
        onChangeText={text => setAveria(text)}
      />
      <TextInput
        value={grav}
        placeholder="Gravedad: "
        onChangeText={text => setGrav(text)}
      />
      <TextInput
        value={obs}
        placeholder="Observación: "
        onChangeText={text => setObs(text)}
      />
      <TextInput
        value={codigo}
        placeholder="Código: "
        onChangeText={text => setCodigo(text)}
      />
      <Button title="GUARDAR"
        // buttonStyle={{ 
				// backgroundColor: 'rgba(75, 186, 44, 1)',
        // marginBottom: 15,
        // marginTop: 25,
				// padding: 8}}
				// titleStyle={{ fontSize: 16}}
        onPress={() => updateInfo(vin, area, averia, grav, obs, codigo)} />
      <Button title="VOLVER"
        // buttonStyle={{ 
				// backgroundColor: 'rgba(222, 79, 79, 0.9)',
				// padding: 8}}
				// titleStyle={{ fontSize: 16}}
        onPress={() => navigation.navigate("Escanear")} />
    </View>
  );
}

const updateInfo = async (vin, area, averia, grav, obs, codigo)=> {
  let result = await addInfo(vin, area, averia, grav, obs, codigo)
  console.log(result)
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
    backgroundColor: "#eee",
    padding: 15,
    marginBottom: 10,
    borderRadius: 6
  },
  code: {
    fontWeight: 'bold',
    fontSize: 23
  }
});