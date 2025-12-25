// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Appbar, Text } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import SyncManager from "./SyncManager";

export default function AppLayout() {
  const { logout, loading, session } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/(app)"); // 🔥 ESTA ES LA CLAVE
    } else {
      router.replace("/(auth)/login");
    }
  }, [session, loading, router]);

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
                color="white"
                size={30}
                onPress={() => router.replace("/(app)/HomeScreen")}
              />
              <Appbar.Action
                icon="barcode-scan"
                size={30}
                color="white"
                onPress={() => router.replace("/(app)/ScannerScreen")}
              />
              <Appbar.Action
                icon="clipboard-list-outline"
                color="white"
                size={30}
                onPress={() => router.replace("/(app)/HistoryScreen")}
              />

              {/* Animación de sincronización */}
              {syncing && <Text>SYNC</Text>}
              {syncing && (
                <LottieView
                  source={require("../../src/utils/Syncwhite.json")}
                  autoPlay
                  loop
                  style={{
                    width: 30,
                    height: 30,
                    alignSelf: "center",
                    backgroundColor: "transparent",
                  }}
                />
              )}

              {/* Título */}
              <Appbar.Content title="" />

              {/* Iconos derecha */}
              <Appbar.Action
                icon="logout"
                color="white"
                size={30}
                onPress={logout}
              />
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
