// app/(app)/_layout.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AppHeader from "../../src/components/AppbarHeader";
import { useAuth } from "../../src/context/AuthContext";
import { ScansProvider } from "../../src/context/ScanContext";
import { AppStatusProvider } from "../../src/context/TransportAndLocationContext";
import "../../src/services/gps/locationTask";
import { useLocationStatus } from "../../src/services/gps/useLocationStatus";
import SyncManager from "./SyncManager";

export default function AppLayout() {
  const { logout, loading, session } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  function LocationBootstrap() {
    useLocationStatus();
    return null;
  }

  useEffect(() => {
    if (!loading && session) {
      router.replace("/(app)/HomeScreen");
    } else if (!loading && !session) {
      router.replace("/(auth)/login");
    }
  }, [session, loading, router]);

  return (
    <>
      <SyncManager onSyncChange={setSyncing} />
      <ScansProvider>
        <AppStatusProvider>
          <LocationBootstrap />
          <AppHeader syncing={syncing} logout={logout} />
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: "transparent",
              },
              headerShown: false,
            }}
          />
        </AppStatusProvider>
      </ScansProvider>
    </>
  );
}
