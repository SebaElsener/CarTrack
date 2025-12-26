import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, setLoading } = useAuth();
  const { showError } = useAuth();

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      showError("Usuario o clave inválidos");
      return;
    }

    router.replace("/(app)");
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
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
