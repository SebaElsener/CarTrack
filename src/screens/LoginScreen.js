import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [transportNbr, setTransportNbrLocal] = useState("");
  const { loading, setLoading, setTransportNbr, setOperatorName } = useAuth();
  const { showToast } = useToast();

  const login = async () => {
    if (!transportNbr?.trim()) {
      showToast("Ingrese número de transporte", "error");
      return;
    }

    setLoading(true);

    // 1️⃣ Login técnico en Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: "transportistas@cooptacor.com.ar",
      password: "Transportistas1234",
    });

    if (error) {
      setLoading(false);
      showToast("Error al iniciar sesión", "error");
      return;
    }

    // 2️⃣ Buscar operador
    const { data, error: operatorError } = await supabase
      .schema("carpointer")
      .from("transportistas")
      .select("name")
      .eq("transport_nbr", transportNbr.trim())
      .single();

    console.log("operatorError:", operatorError);
    console.log("data:", data);

    if (operatorError || !data) {
      setLoading(false);
      showToast("Transportista no encontrado", "error");
      return;
    }

    // 3️⃣ Guardar datos en el contexto
    setOperatorName(data.name);
    await setTransportNbr(transportNbr);

    setLoading(false);

    router.replace("/(app)");
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Nro. de transporte"
        value={transportNbr}
        onChangeText={setTransportNbrLocal}
        mode="outlined"
        style={styles.input}
      />

      <Button
        labelStyle={{ fontSize: 18, padding: 4 }}
        mode="contained"
        onPress={login}
        style={styles.button}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          "Ingresar"
        )}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 150 },
  input: { marginTop: 15, backgroundColor: "#fff" },
  button: { marginTop: 25, height: 55 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 55,
  },
});
