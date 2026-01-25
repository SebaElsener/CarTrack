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
import IngDespList from "../components/IngDespList";
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
          <View style={{}}>
            <TextInput
              label="Batea"
              keyboardType="number-pad"
              value={transportUnit}
              onChangeText={(v) => {
                setTransportUnit(v);
                if (v?.trim() && !(totalUnits + "").trim()) {
                  setTransportError("Ingresar cantidad unidades");
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
          <View
            style={{ flexDirection: "row", alignItems: "center", width: 75 }}
          >
            <TextInput
              hitSlop={{ top: 0, bottom: 0, left: 5, right: 5 }}
              value={totalUnits !== null ? String(totalUnits) : ""}
              onChangeText={(v) => {
                const numeric = v.replace(/[^0-9]/g, "");
                const value = numeric.length ? Number(numeric) : null;

                setTotalUnits(value);

                if (transportUnit?.trim() && value === null) {
                  setTransportError("Ingresar cantidad unidades");
                } else {
                  setTransportError("");
                }
              }}
              keyboardType="number-pad"
              label="Cantidad"
              placeholder="-"
              underlineColor="transparent"
              mode="flat"
              editable={!!transportUnit?.trim()}
              pointerEvents={transportUnit?.trim() ? "auto" : "none"}
              theme={customTheme}
              style={styles.counterInput}
              contentStyle={{
                fontSize: 14,
                fontWeight: "700",
                color: "#eeeeeeff",
                paddingVertical: 0,
              }}
              left={
                <TextInput.Affix
                  text={`${transportScans} / `}
                  textStyle={{ color: "#eeeeeeff", fontWeight: "700" }}
                />
              }
            />
          </View>

          <View style={{ width: 120 }}>
            <IngDespList />
          </View>
        </View>
        {transportError ? (
          <Text
            style={{
              color: "rgba(211, 56, 56, 0.96)",
              fontSize: 18,
              fontWeight: "600",
              position: "absolute",
              top: 120,
              left: 18,
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
          <Text style={styles.modalTitle}>Batea completada</Text>
          <Text>Equipo: {transportUnit}</Text>
          <Text>Unidades: {transportScans}</Text>

          <Button
            mode="contained"
            onPress={resetTransport}
            style={{ marginTop: 16 }}
          >
            Nueva colección
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  scanBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    //width: "100%",
    //paddingHorizontal: 4,
    //paddingBottom: 33,
    alignItems: "center",
    gap: 3,
  },
  input: {
    //flex: 2,
    //marginRight: 15,
    backgroundColor: "transparent",
    //width: 120,
    fontSize: 14,
    fontWeight: 700,
    width: 80,
  },
  counter: {
    fontSize: 14,
    fontWeight: 700,
    color: "#eeeeeeff",
    backgroundColor: "transparent",
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
  counterInput: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
  },
});
