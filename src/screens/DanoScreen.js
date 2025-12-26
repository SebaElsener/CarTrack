import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, IconButton, Text, TextInput } from "react-native-paper";
import Areas from "../components/Areas";
import Averias from "../components/Averias";
import Codigos from "../components/Codigos";
import Gravedades from "../components/Gravedades";
import { useToast } from "../components/ToastProvider";
import { addInfo } from "../database/Database";
import { requestSync } from "../services/syncTrigger";
//import areas from '../utils/areas.json' with { type: 'json' };
const areas = require("../utils/areas.json");
const averias = require("../utils/averias.json");
const gravedades = require("../utils/gravedades.json");
const codigos = require("../utils/codigos.json");

export default function DanoScreen() {
  const { showToast } = useToast();
  const router = useRouter();

  const { vinFromRouter } = useLocalSearchParams();
  const vin = vinFromRouter;

  const [area, setArea] = useState("");
  const [averia, setAveria] = useState("");
  const [grav, setGrav] = useState("");
  const [obs, setObs] = useState("");
  const [codigo, setCodigo] = useState("");

  const areasDropdown = areas.map((p) => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id, // 👈 lo que se guarda
  }));

  const averiasDropdown = averias.map((p) => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id, // 👈 lo que se guarda
  }));

  const gravedadesDropdown = gravedades.map((p) => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id, // 👈 lo que se guarda
  }));

  const codigosDropdown = codigos.map((p) => ({
    label: p.descripcion, // 👈 lo que se muestra
    value: p.id, // 👈 lo que se guarda
  }));

  const updateInfo = async (vin, area, averia, grav, obs, codigo) => {
    let result = await addInfo(vin, area, averia, grav, obs, codigo);
    requestSync();
    if (result === "Información actualizada")
      showToast("ACTUALIZADO OK!", "success");
    else {
      showToast("Error al actualizar", "error");
    }
  };

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
      <View style={styles.textInputContainer}>
        <TextInput
          value={obs}
          mode="outlined"
          autoCapitalize="characters"
          outlineStyle={{ borderRadius: 6 }}
          style={{ padding: 2, textAlign: "center" }}
          outlineColor="#afafafbc"
          activeOutlineColor="#afafafbc"
          contentStyle={{ backgroundColor: "#eaeaea87", fontWeight: "medium" }}
          placeholder="Observación"
          onChangeText={(text) => setObs(text)}
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
          labelStyle={{
            fontSize: 16,
            paddingVertical: 4,
            color: "#343333d2",
          }}
          mode="contained"
          buttonColor="rgba(140, 197, 183, 0.88)"
          //textColor='rgba(41, 30, 30, 0.89)'
          onPress={() => updateInfo(vin, area, averia, grav, obs, codigo)}
        >
          GUARDAR
        </Button>
        <Button
          labelStyle={{ fontSize: 16, paddingVertical: 4, color: "#343333d2" }}
          mode="contained"
          buttonColor="rgba(140, 197, 183, 0.88)"
          //textColor='rgba(41, 30, 30, 0.89)'
          onPress={() =>
            router.replace({
              pathname: "/(app)/DanoScreen",
              params: {
                vinFromRouter: vin,
              },
            })
          }
        >
          AGREGAR OTRO DAÑO
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#d3e9e97b",
    padding: 20,
    borderRadius: 20,
    margin: 15,
  },
  code: {
    fontWeight: "bold",
    fontSize: 25,
    color: "#312f2fce",
    textAlign: "center",
    marginBottom: 30,
    //marginTop: 30,
  },
  buttonContainer: {
    //marginTop: 10,
  },
  textInputContainer: {
    marginBottom: 10,
    boxShadow: "0px 2px 3px 0px #1a1a1a29",
  },
  takePhotoContainer: {
    marginBottom: 20,
  },
});
