// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { Appbar, Text } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import SyncManager from "./SyncManager";

export default function AppLayout() {
  const { logout } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  return (
    <>
      <SyncManager onSyncChange={setSyncing} />
      <Stack
        screenOptions={{
          header: () => (
            <Appbar.Header>
              {/* Iconos izquierda */}
              <Appbar.Action icon="home" onPress={() => router.replace("/(app)/HomeScreen")} />
              <Appbar.Action icon="barcode-scan" onPress={() => router.replace("/(app)/ScannerScreen")} />
              <Appbar.Action icon="clipboard-list-outline" onPress={() => router.replace("/(app)/HistoryScreen")} />

              {/* Animación de sincronización */}
              {syncing && <Text>SYNC</Text>}
              {syncing && (
                <LottieView
                  source={require("../../src/utils/Sync.json")}
                  autoPlay
                  loop
                  style={{ width: 34, height: 34, alignSelf: "center" }}
                />
              )}

              {/* Título */}
              <Appbar.Content title="" />

              {/* Iconos derecha */}
              <Appbar.Action icon="logout" onPress={logout} />
            </Appbar.Header>
          ),
        }}
      />
    </>
  );
}
