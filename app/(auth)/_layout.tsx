
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  useEffect(() => {
    if (!loading && session) {
      router.replace("/(app)"); // 🔥 ESTA ES LA CLAVE
    }
  }, [session, loading]);

  return <Stack screenOptions={{
            headerShown: false
        }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
})