import { StyleSheet, View } from "react-native";
import {
  Button,
  DefaultTheme,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { useScans } from "../context/ScanContext";

export default function TransportBar() {
  const {
    scansCount,
    transportUnit,
    setTransportUnit,
    totalUnits,
    setTotalUnits,
    completed,
    resetDownload,
  } = useScans();

  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      // Cambia el color del label/placeholder inactivo
      placeholder: "#eeeeeeff",
      // Cambia el color del label/borde activo (cuando se enfoca)
      primary: "#eeeeeeff",
      // Para versiones v5+ de react-native-paper:
      onSurfaceVariant: "#eeeeeeff",
    },
  };

  return (
    <View>
      <View style={styles.scanBar}>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Batea Nro."
            value={transportUnit}
            onChangeText={setTransportUnit}
            contentStyle={{
              fontWeight: 700,
              color: "#eeeeeeff",
            }}
            underlineColor="transparent"
            mode="flat"
            style={styles.input}
            theme={customTheme}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Unidades"
            value={totalUnits ? String(totalUnits) : ""}
            onChangeText={(v) => setTotalUnits(Number(v))}
            underlineColor="transparent"
            contentStyle={{
              fontWeight: 700,
              color: "#eeeeeeff",
            }}
            theme={customTheme}
            keyboardType="numeric"
            mode="flat"
            style={styles.inputSmall}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.counter}>
            {scansCount} / {totalUnits || "-"}
          </Text>
        </View>
      </View>

      <Portal>
        <Modal
          visible={completed}
          dismissable={false}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Descarga completa</Text>
          <Text>Equipo: {transportUnit}</Text>
          <Text>Unidades: {scansCount}</Text>

          <Button
            mode="contained"
            onPress={resetDownload}
            style={{ marginTop: 16 }}
          >
            Nueva descarga
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  scanBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    //width: "100%",
    paddingLeft: 4,
    paddingBottom: 33,
    alignItems: "center",
  },
  input: {
    //flex: 2,
    //marginRight: 15,
    backgroundColor: "transparent",
    //width: 120,
    fontSize: 15,
    fontWeight: 700,
  },
  inputSmall: {
    //flex: 1,
    //marginRight: 15,
    backgroundColor: "transparent",
    //width: 120,
    fontSize: 15,
    fontWeight: 700,
  },
  counter: {
    fontSize: 15,
    fontWeight: 700,
    color: "#eeeeeeff",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
