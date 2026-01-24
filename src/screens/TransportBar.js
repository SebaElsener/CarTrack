import { StyleSheet, View } from "react-native";
import {
  Button,
  DefaultTheme,
  Modal,
  Portal,
  ProgressBar,
  Text,
  TextInput,
} from "react-native-paper";
import { useScans } from "../context/ScanContext";

export default function TransportBar() {
  const {
    transportUnit,
    transportActive,
    setTransportUnit,
    transportScans,
    totalUnits,
    setTransportError,
    completed,
    resetTransport,
    transportError,
    setTotalUnits,
  } = useScans();

  const progress =
    totalUnits > 0 ? Math.min(transportScans / totalUnits, 1) : 0;

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
      <View style={{ flexDirection: "column" }}>
        <View style={styles.scanBar}>
          <View style={{ flex: 1 }}>
            <TextInput
              label="Batea Nro."
              keyboardType="number-pad"
              value={transportUnit}
              onChangeText={(v) => {
                setTransportUnit(v);
                if (v?.trim() && !(totalUnits + "").trim()) {
                  setTransportError("Debe ingresar la cantidad de unidades");
                } else {
                  setTransportError("");
                }
              }}
              contentStyle={{ fontWeight: 700, color: "#eeeeeeff" }}
              underlineColor="transparent"
              mode="flat"
              style={styles.input}
              theme={customTheme}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              label="Cantidad"
              keyboardType="number-pad"
              value={totalUnits ? String(totalUnits) : ""}
              onChangeText={(v) => {
                setTotalUnits(v ? Number(v) : "");
                if (transportUnit?.trim() && !v) {
                  setTransportError("Debe ingresar la cantidad de unidades");
                } else {
                  setTransportError("");
                }
              }}
              underlineColor="transparent"
              contentStyle={{ fontWeight: 700, color: "#eeeeeeff" }}
              theme={customTheme}
              mode="flat"
              style={styles.inputSmall}
              editable={!!transportUnit?.trim()}
            />
          </View>
          <View style={{ width: 50 }}>
            <Text style={styles.counter}>
              {transportScans} / {totalUnits || "-"}
            </Text>
          </View>
        </View>
        {transportError ? (
          <Text
            style={{
              color: "#f14f4fff",
              fontSize: 13,
              fontWeight: "700",
              position: "absolute",
              marginTop: 117,
              marginLeft: 50,
              textShadowColor: "#020202ff",
              textShadowOffset: 4,
              textShadowRadius: 4,
            }}
          >
            {transportError}
          </Text>
        ) : null}
        {transportActive && (
          <View>
            <ProgressBar
              progress={progress}
              color={completed ? "#2ecc71" : "#4fa3a5"}
              style={styles.progress}
            />
          </View>
        )}
      </View>

      <Portal>
        <Modal
          visible={completed}
          dismissable={false}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Descarga completa</Text>
          <Text>Equipo: {transportUnit}</Text>
          <Text>Unidades: {transportScans}</Text>

          <Button
            mode="contained"
            onPress={resetTransport}
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
    paddingHorizontal: 4,
    //paddingBottom: 33,
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
    fontSize: 14,
    fontWeight: 700,
  },
  counter: {
    fontSize: 14,
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
  progress: {
    height: 6,
    borderRadius: 4,
    position: "absolute",
    marginTop: -5,
    //marginVertical: 8,
  },
});
