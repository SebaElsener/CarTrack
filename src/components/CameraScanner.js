import { Camera, CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { attemptVinAutoFixOEM, isValidVIN } from "../components/vinUtils";

export default function CameraScanner({ onVinScanned }) {
  const handleScan = ({ data }) => {
    if (!data) return;

    let vinOriginal = data
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 17);

    if (vinOriginal.length !== 17) return;

    let vinFinal = vinOriginal;

    if (!isValidVIN(vinOriginal)) {
      const fixedVin = attemptVinAutoFixOEM(vinOriginal);

      if (fixedVin && fixedVin !== vinOriginal) {
        vinFinal = fixedVin;
      } else {
        return;
      }
    }

    onVinScanned(vinFinal);
  };

  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();

      setHasPermission(status === "granted");
    };

    getPermissions();
  }, []);

  if (hasPermission === null) return null;

  if (hasPermission === false) return null;

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        autofocus="on"
        onBarcodeScanned={handleScan}
        barcodeScannerSettings={{
          barcodeTypes: ["datamatrix", "code128", "code39"],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },
});
