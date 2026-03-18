import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AppHeader from "../../src/components/AppbarHeader";
import { useAuth } from "../../src/context/AuthContext";
import { ScansProvider } from "../../src/context/ScanContext";
import { AppStatusProvider } from "../../src/context/TransportAndLocationContext";
import SyncManager from "./SyncManager";

export default function AppLayout() {
  const { logout, loading, session, operator } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!session || !operator) {
      router.replace("/(auth)/login");
    }
  }, [session, operator, loading]);

  if (loading || !session || !operator) {
    return null;
  }

  return (
    <>
      <SyncManager onSyncChange={setSyncing} />
      <ScansProvider>
        <AppStatusProvider>
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
