import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { savePendingImage, savePict } from "../database/Database";
import { requestSync } from "../services/syncTrigger";

export async function compressAndResize(uri) {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: 800 } }, // mantiene proporción
    ],
    {
      compress: 0.25, // 25% calidad
      format: ImageManipulator.SaveFormat.jpg,
    },
  );

  return manipResult.uri;
}

export default function CameraScreen() {
  const { showToast } = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [fotos, setFotos] = useState([]);
  const { user } = useAuth();
  const carpetaBase = FileSystem.documentDirectory + "fotos/";
  const { vinFromRouter, remote_id } = useLocalSearchParams();
  const vin = vinFromRouter;
  const remoteId = remote_id;

  useEffect(() => {
    listarFotos();
  }, []);

  // -------------------------------------------------------
  // Crear carpetas automáticamente según año/mes
  // -------------------------------------------------------
  const crearCarpetaSiNoExiste = async (path) => {
    const carpetaExiste = await FileSystem.getInfoAsync(path);
    if (!carpetaExiste.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  };

  // -------------------------------------------------------
  // Listar fotos y metadatos
  // -------------------------------------------------------
  const listarFotos = async () => {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const path = `${carpetaBase}${year}/${month}/${vin}/`;
    await crearCarpetaSiNoExiste(path);
    const archivos = await FileSystem.readDirectoryAsync(path);

    const lista = [];

    for (const archivo of archivos) {
      if (archivo.endsWith(".jpg")) {
        const uri = path + archivo;

        // metadatos asociados
        const metaPath = uri.replace(".jpg", ".json");

        let metadatos = {};
        const existeMeta = await FileSystem.getInfoAsync(metaPath);

        if (existeMeta.exists) {
          const contenido = await FileSystem.readAsStringAsync(metaPath);
          metadatos = JSON.parse(contenido);
        }

        lista.push({ uri, metadatos, carpeta: path });
      }
    }

    setFotos(lista);
  };

  // -------------------------------------------------------
  // Tomar foto y guardar con metadatos
  // -------------------------------------------------------
  const tomarYGuardar = async () => {
    try {
      const foto = await cameraRef.takePictureAsync();

      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
      const carpeta = `${carpetaBase}${year}/${month}/${vin}/`;
      await crearCarpetaSiNoExiste(carpeta);

      // Hacer único a cada archivo de foto agregando hhmmss
      const fechaActual = new Date();
      const hh = fechaActual.getHours().toString();
      const mm = fechaActual.getMinutes().toString();
      const ss = fechaActual.getSeconds().toString();
      let nombre = `${vin}_${hh}${mm}${ss}.jpg`;
      let destino = carpeta + nombre;

      // guardar la foto
      await FileSystem.copyAsync({ from: foto.uri, to: destino });

      // guardar metadatos
      const metadatos = {
        fecha: new Date().toISOString(),
        codigo: null, // se puede actualizar luego
        carpeta,
      };

      await FileSystem.writeAsStringAsync(
        destino.replace(".jpg", ".json"),
        JSON.stringify(metadatos),
      );

      ////////////////////////////////////

      const imageUri = await compressAndResize(foto.uri);
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Convertir Base64 → Uint8Array (lo que Supabase acepta)
      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // Guardar en DB local
      const pictId = await savePict(
        vin,
        remoteId,
        JSON.stringify(metadatos),
        user?.email,
      );

      //  Guardar name + binary en tabla local para subir luego a supabase bucket
      await savePendingImage(pictId, nombre, binary); /// lastInsertRowId devuelve el id único AUTOINCREMENT que asigna sqlite

      requestSync();

      showToast("Foto guardada ✔", "success");
      await listarFotos();
    } catch (error) {
      console.log("Error al tomar/guardar foto:", error);
      showToast("Error al tomar/guardar foto", error);
    }
  };

  const loadLocalPict = async () => {
    try {
      // Permiso galería
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast("Permiso de galería denegado", "error");
        return;
      }

      // Abrir selector
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled) return;

      const foto = result.assets[0];

      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
      const carpeta = `${carpetaBase}${year}/${month}/${vin}/`;
      await crearCarpetaSiNoExiste(carpeta);

      // nombre único
      const fechaActual = new Date();
      const hh = fechaActual.getHours().toString().padStart(2, "0");
      const mm = fechaActual.getMinutes().toString().padStart(2, "0");
      const ss = fechaActual.getSeconds().toString().padStart(2, "0");

      const nombre = `${vin}_${hh}${mm}${ss}.jpg`;
      const destino = carpeta + nombre;

      // copiar imagen seleccionada
      await FileSystem.copyAsync({
        from: foto.uri,
        to: destino,
      });

      // metadatos
      const metadatos = {
        fecha: new Date().toISOString(),
        codigo: null,
        carpeta,
        origen: "galeria",
      };

      await FileSystem.writeAsStringAsync(
        destino.replace(".jpg", ".json"),
        JSON.stringify(metadatos),
      );

      // ---- compresión + base64 ----
      const imageUri = await compressAndResize(destino);

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // DB local
      const pictId = await savePict(
        vin,
        JSON.stringify(metadatos),
        user?.email,
      );

      await savePendingImage(pictId, nombre, binary);

      requestSync();

      showToast("Foto cargada desde galería ✔", "success");
      await listarFotos();
    } catch (error) {
      console.error(error);
      showToast("Error al cargar la imagen", "error");
    }
  };

  // -------------------------------------------------------
  // Eliminar foto + metadatos
  // -------------------------------------------------------
  const eliminarFoto = async (uri) => {
    await FileSystem.deleteAsync(uri);
    await FileSystem.deleteAsync(uri.replace(".jpg", ".json"));
    await listarFotos();
  };

  // -------------------------------------------------------
  // -------------------------------------------------------
  if (!permission?.granted) {
    return <Button title="Dar permiso cámara" onPress={requestPermission} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "rgba(172, 180, 196, 1)" }}>
      <View style={{ height: 350 }}>
        <CameraView ref={setCameraRef} style={{ flex: 1 }} />
      </View>

      <View style={{ flexDirection: "row" }}>
        <Button
          icon="upload"
          mode="contained"
          style={{
            width: "40%",
          }}
          titleStyle={{ fontSize: 18 }}
          buttonColor="green"
          onPress={() => loadLocalPict()}
        >
          Cargar foto...
        </Button>
        <Button
          icon="camera"
          mode="contained"
          style={{
            width: "60%",
          }}
          titleStyle={{ fontSize: 18 }}
          onPress={() => tomarYGuardar()}
        >
          Tomar foto
        </Button>
      </View>

      <Text style={{ fontSize: 20, fontWeight: "bold", margin: 15 }}>
        {vin}
      </Text>

      {fotos.map((item, i) => (
        <View
          key={i}
          style={{
            backgroundColor: "rgba(64, 106, 185, 0.14)",
            margin: 10,
            padding: 15,
            borderRadius: 12,
            elevation: 3,
          }}
        >
          <Image
            source={{ uri: item.uri }}
            style={{ width: "100%", height: 200, borderRadius: 10 }}
          />

          <Text style={{ marginTop: 10 }}>📁 {item.uri.split("/").pop()}</Text>

          <Text style={{ opacity: 0.6 }}>
            Fecha:
            {new Intl.DateTimeFormat("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone: "America/Argentina/Buenos_Aires",
            }).format(new Date(item.metadatos.fecha))}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(211, 70, 70, 0.77)",
                padding: 10,
                borderRadius: 8,
                flex: 1,
              }}
              onPress={() => eliminarFoto(item.uri)}
            >
              <Text style={{ textAlign: "center", color: "#eeededff" }}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
