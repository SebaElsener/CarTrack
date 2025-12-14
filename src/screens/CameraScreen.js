
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { useEffect, useState } from "react";
import { Button, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { savePict } from "../database/Database";
import { supabase } from "../services/supabase";
import { syncPendingPicts } from "../services/sync";

export async function compressAndResize(uri) {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: 800 } }, // mantiene proporción
    ],
    {
      compress: 0.25,   // 25% calidad
      format: ImageManipulator.SaveFormat.jpg,
    }
  );

  return manipResult.uri;
}

export default function CameraScreen({ route }) {

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [fotos, setFotos] = useState([]);

  const carpetaBase = FileSystem.documentDirectory + "fotos/";
  const vin = route.params.lastResult

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
    const path = `${carpetaBase}${year}/${month}/${vin}/`
    await crearCarpetaSiNoExiste(path)
    const archivos = await FileSystem.readDirectoryAsync(path)

    const lista = []

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
    const foto = await cameraRef.takePictureAsync();

    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const carpeta = `${carpetaBase}${year}/${month}/${vin}/`;
    await crearCarpetaSiNoExiste(carpeta);

      // Hacer único a cada archivo de foto agregando hhmmss
      const fechaActual = new Date()
      const hh = fechaActual.getHours().toString()
      const mm = fechaActual.getMinutes().toString()
      const ss = fechaActual.getSeconds().toString()
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
      JSON.stringify(metadatos)
    )

  ////////////////////////////////////

const imageUri = await compressAndResize(foto.uri)

const base64 = await FileSystem.readAsStringAsync(imageUri, {
  encoding: FileSystem.EncodingType.Base64,
});

  // 2. Convertir Base64 → Uint8Array (lo que Supabase acepta)
  const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  // Subir a Supabase Storage
  const { data, error } = await supabase.storage
    .from("pics")                 // ← tu bucket
    .upload(nombre, binary, {
      contentType: 'image/jpg',
      upsert: true
    });
    if (error) {
    console.log("ERROR SUBIENDO FOTO:", error);
    return null;
  }

/////////////////////////

    // // URL publica bucket
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("pics")
      .getPublicUrl(nombre)
    if (urlError) throw urlError
    const publicUrl = publicUrlData.publicUrl

    // Guardar en DB local
    await savePict(vin, publicUrl, JSON.stringify(metadatos))
    // Guardar en DB supabase
    await syncPendingPicts()

    alert("Foto guardada ✔");
    await listarFotos();
  }

  // -------------------------------------------------------
  // Eliminar foto + metadatos
  // -------------------------------------------------------
  const eliminarFoto = async (uri) => {
    await FileSystem.deleteAsync(uri);
    await FileSystem.deleteAsync(uri.replace(".jpg", ".json"));
    await listarFotos();
  };

  // -------------------------------------------------------
  // UI bonita estilo PRO
  // -------------------------------------------------------
  if (!permission?.granted) {
    return <Button title="Dar permiso cámara" onPress={requestPermission} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'rgba(172, 180, 196, 1)' }}>
      <View style={{ height: 350 }}>
        <CameraView
          ref={setCameraRef}
          style={{ flex: 1 }}
        />
      </View>

      <Button 
        title="📸 Tomar foto"
        buttonStyle={{ backgroundColor: 'rgba(74, 119, 202, 0.93)'}}
        titleStyle={{ fontSize: 18}}
        onPress={()=>tomarYGuardar()} />

      <Text style={{ fontSize: 20, fontWeight: "bold", margin: 15 }}>
        {route.params.lastResult}
      </Text>

      {fotos.map((item, i) => (
        <View
          key={i}
          style={{
            backgroundColor: 'rgba(64, 106, 185, 0.14)',
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

          <Text style={{ marginTop: 10 }}>
            📁 {item.uri.split("/").pop()}
          </Text>

          <Text style={{ opacity: 0.6 }}>
            Fecha: {item.metadatos.fecha}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>

            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(211, 70, 70, 0.77)',
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