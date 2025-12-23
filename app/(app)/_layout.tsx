// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
//import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import SyncManager from "./SyncManager";

export default function AppLayout() {
  const { logout, loading, session, setLoading } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    console.log(loading, session);
    if (!loading && session) {
      router.replace("/(app)"); // 🔥 ESTA ES LA CLAVE
    } else {
      router.replace("/(auth)/login");
    }
  }, [session, loading]);

  // if (loading) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <>
      <SyncManager onSyncChange={setSyncing} />
      <Stack
        screenOptions={{
          header: () => (
            <Appbar.Header>
              {/* Iconos izquierda */}
              <Appbar.Action
                icon="home"
                size={35}
                onPress={() => router.replace("/(app)/HomeScreen")}
              />
              <Appbar.Action
                icon="barcode-scan"
                size={35}
                onPress={() => router.replace("/(app)/ScannerScreen")}
              />
              <Appbar.Action
                icon="clipboard-list-outline"
                size={35}
                onPress={() => router.replace("/(app)/HistoryScreen")}
              />

              {/* Animación de sincronización */}
              {syncing && <Text>SYNC</Text>}
              {syncing && (
                <LottieView
                  source={require("../../src/utils/Sync.json")}
                  autoPlay
                  loop
                  style={{ width: 35, height: 35, alignSelf: "center" }}
                />
              )}

              {/* Título */}
              <Appbar.Content title="" />

              {/* Iconos derecha */}
              <Appbar.Action icon="logout" size={35} onPress={logout} />
            </Appbar.Header>
          ),
        }}
      />
    </>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
