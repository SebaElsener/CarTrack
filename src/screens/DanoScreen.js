
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import Areas from '../components/Areas';
import Averias from '../components/Averias';
import Codigos from '../components/Codigos';
import Gravedades from '../components/Gravedades';
import { addInfo } from '../database/Database';
import { requestSync } from "../services/syncTrigger";
import areas from '../utils/areas.json' with { type: 'json' };
import averias from '../utils/averias.json' with { type: 'json' };
import codigos from '../utils/codigos.json' with { type: 'json' };
import gravedades from '../utils/gravedades.json' with { type: 'json' };

const router = useRouter()

export default function DanoScreen() {

  const { vinFromRouter } = useLocalSearchParams();
  const vin = vinFromRouter

  const [area, setArea] = useState("")
  const [averia, setAveria] = useState("")
  const [grav, setGrav] = useState("")
  const [obs, setObs] = useState("")
  const [codigo, setCodigo] = useState("")

  const areasDropdown = areas.map(p => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id,          // 👈 lo que se guarda
  }))

    const averiasDropdown = averias.map(p => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id,          // 👈 lo que se guarda
  }))

    const gravedadesDropdown = gravedades.map(p => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id,          // 👈 lo que se guarda
  }))

    const codigosDropdown = codigos.map(p => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id,          // 👈 lo que se guarda
  }))

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
      <View>
      <Averias
        averias={averiasDropdown}
        selectedValue={averia}
        onSelect={(item) => setAveria(item.value)}
      />
      </View>
      <View>
      <Gravedades
        gravedades={gravedadesDropdown}
        selectedValue={grav}
        onSelect={(item) => setGrav(item.value)}
      />
      </View>
      <View style={ styles.textInputContainer}>
      <TextInput
        value={obs}
        mode='outlined'
        autoCapitalize='characters'
        outlineStyle={{ borderRadius: 6 }}
        style={{ padding: 2, textAlign: 'center' }}  
        outlineColor='white'
        contentStyle={{ backgroundColor: 'white', fontWeight: 'medium' }}
        placeholder="Observación"
        onChangeText={text => setObs(text)}
      />
      </View>
      <View>
      <Codigos
        codigos={codigosDropdown}
        selectedValue={codigo}
        onSelect={(item) => setCodigo(item.value)}
      />
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.takePhotoContainer}>
          <IconButton
            style={styles.iconButton}
            size={40}
            icon="camera-plus"
            iconColor="rgba(133, 207, 189, 0.98)"
            onPress={() =>
              router.push({
                pathname: "/(app)/CameraScreen",
                params: { vinFromRouter: vin },
              })
            }
          ></IconButton>
        </View>
      <Button
        style={{ marginBottom: 15 }}
				labelStyle={{ fontSize: 18, padding: 5, color: '#343333d2' }}
				mode='elevated'
				buttonColor='rgba(140, 197, 183, 0.88)'
				//textColor='rgba(41, 30, 30, 0.89)'
        onPress={() => updateInfo(vin, area, averia, grav, obs, codigo)}>
        GUARDAR
      </Button>
      <Button
				labelStyle={{ fontSize: 18, padding: 5, color: '#343333d2'  }}
				mode='elevated'
				buttonColor='rgba(140, 197, 183, 0.88)'
        //textColor='rgba(41, 30, 30, 0.89)'
        onPress={() => router.replace({
                         pathname: "/(app)/DanoScreen",
                         params: {
                          vin: vin
                         }
                       })}>
        AGREGAR OTRO DAÑO
      </Button>
      </View>
      {/* <View style={styles.volverButtonContainer}>
      <Button
				labelStyle={{ fontSize: 18, padding: 5, color: '#343333d2'  }}
				mode='elevated'
				buttonColor='rgba(140, 197, 183, 0.88)'
        //textColor='rgba(41, 30, 30, 0.89)'
        onPress={() => router.replace("/(app)/ScannerScreen")}>
        VOLVER
      </Button>
      </View> */}
    </View>
  );
}

const updateInfo = async (vin, area, averia, grav, obs, codigo)=> {
  let result = await addInfo(vin, area, averia, grav, obs, codigo)
  requestSync()
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
    fontSize: 25,
    color: "#312f2fce",
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 30
  },
  buttonContainer: {
    marginTop: 10
  },
  volverButtonContainer: {
    marginTop: 15
  },
  textInputContainer: {
    marginBottom: 10,
    boxShadow: '0px 2px 3px 0px #1a1a1a29',
  },
  takePhotoContainer: {
    marginBottom: 30
  }
});