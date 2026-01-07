import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import Areas from "../components/Areas";
import Averias from "../components/Averias";
import Gravedades from "../components/Gravedades";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { addInfo } from "../database/Database";
import { requestSync } from "../services/syncTrigger";
import { useKeyboardHeight } from "../utils/useKeyboardHeight";

const areas = require("../utils/areas.json");
const averias = require("../utils/averias.json");
const gravedades = require("../utils/gravedades.json");
const codigos = require("../utils/codigos.json");

export default function DanoScreen() {
  const { showToast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const { vinFromRouter } = useLocalSearchParams();
  const vin = vinFromRouter;

  const [area, setArea] = useState("");
  const [averia, setAveria] = useState("");
  const [grav, setGrav] = useState("");
  const [obs, setObs] = useState("");
  const [codigo, setCodigo] = useState("");

  // 🔹 errores por campo (solo dropdowns)
  const [errors, setErrors] = useState({
    area: false,
    averia: false,
    grav: false,
    codigo: false,
  });

  const screenHeight = Dimensions.get("window").height;
  const keyboardHeight = useKeyboardHeight();

  const dropdownMaxHeight =
    keyboardHeight > 0
      ? screenHeight - keyboardHeight - 200
      : screenHeight * 0.5;

  const areasDropdown = areas.map((p) => ({
    label: p.descripcion,
    value: p.id,
  }));
  const averiasDropdown = averias.map((p) => ({
    label: p.descripcion,
    value: p.id,
  }));
  const gravedadesDropdown = gravedades.map((p) => ({
    label: p.descripcion,
    value: p.id,
  }));
  const codigosDropdown = codigos.map((p) => ({
    label: p.descripcion,
    value: p.id,
  }));

  // 🔹 validar campos obligatorios (solo dropdowns)
  const validateFields = () => {
    const newErrors = {
      area: !area,
      averia: !averia,
      grav: !grav,
      //codigo: !codigo,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e);
  };

  const handleSave = async () => {
    if (!validateFields()) {
      showToast("Complete todos los campos obligatorios", "error");
      return;
    }

    const result = await addInfo(
      vin,
      area,
      averia,
      grav,
      obs,
      codigo,
      user?.email
    );
    requestSync();
    if (result === "Información actualizada")
      showToast("ACTUALIZADO OK!", "success");
    else showToast("Error al actualizar", "error");
  };

  return (
    <View style={styles.card}>
      <View style={styles.takePhotoContainer}>
        <IconButton
          style={styles.iconButton}
          size={35}
          icon="camera-plus"
          iconColor="rgba(84, 188, 162, 0.96)"
          onPress={() =>
            router.push({
              pathname: "/(app)/CameraScreen",
              params: { vinFromRouter: vin },
            })
          }
        />
      </View>

      <Text style={styles.code}>{vin}</Text>

      <View>
        <Areas
          style={{ height: 300 }}
          areas={areasDropdown}
          selectedValue={area}
          maxHeight={dropdownMaxHeight}
          onSelect={(item) => {
            setArea(item.value);
            setErrors((prev) => ({ ...prev, area: false })); // 🔹 limpia error
          }}
          error={errors.area}
        />
      </View>

      <View>
        <Averias
          averias={averiasDropdown}
          selectedValue={averia}
          onSelect={(item) => {
            setAveria(item.value);
            setErrors((prev) => ({ ...prev, averia: false })); // 🔹 limpia error
          }}
          error={errors.averia}
        />
      </View>

      <View>
        <Gravedades
          gravedades={gravedadesDropdown}
          selectedValue={grav}
          onSelect={(item) => {
            setGrav(item.value);
            setErrors((prev) => ({ ...prev, grav: false })); // 🔹 limpia error
          }}
          error={errors.grav}
        />
      </View>

      <View style={styles.textInputContainer}>
        <TextInput
          value={obs}
          mode="outlined"
          autoCapitalize="characters"
          outlineStyle={{ borderRadius: 6 }}
          style={{ textAlign: "center" }}
          outlineColor="#afafafbc" // 🔹 no validar
          activeOutlineColor="#afafafbc"
          contentStyle={{ backgroundColor: "#eaeaea87", fontWeight: "medium" }}
          placeholder="Observación"
          onChangeText={(text) => setObs(text)}
        />
      </View>

      {/* <View>
        <Codigos
          codigos={codigosDropdown}
          selectedValue={codigo}
          onSelect={(item) => {
            setCodigo(item.value);
            setErrors((prev) => ({ ...prev, codigo: false })); // 🔹 limpia error
          }}
          error={errors.codigo}
        />
      </View> */}

      <View style={styles.buttonContainer}>
        <Button
          style={{ marginBottom: 15 }}
          labelStyle={{ fontSize: 14, color: "#343333d2" }}
          mode="contained"
          buttonColor="rgba(140, 197, 183, 0.88)"
          onPress={handleSave}
        >
          GUARDAR
        </Button>

        <Button
          labelStyle={{ fontSize: 14, color: "#343333d2" }}
          mode="contained"
          buttonColor="rgba(140, 197, 183, 0.88)"
          onPress={() =>
            router.replace({
              pathname: "/(app)/DanoScreen",
              params: { vinFromRouter: vin },
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
    fontSize: 22,
    color: "#312f2fce",
    textAlign: "center",
    marginBottom: 25,
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 25,
  },
  textInputContainer: {
    marginBottom: 10,
    boxShadow: "0px 2px 3px 0px #1a1a1a29",
  },
  takePhotoContainer: {
    marginTop: -10,
    marginLeft: -8,
    position: "absolute",
  },
});
