import { registerSyncTrigger } from "@/src/services/syncTrigger";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { getDb, initDB } from "../../src/database/Database";
import { danoCloudUpdate, syncPendingPicts, syncPendingScans } from "../../src/services/sync";

interface Props {
  onSyncChange?: (syncing: boolean) => void;
}

export default function SyncManager({ onSyncChange }: Props) {

  useEffect(() => {
    registerSyncTrigger(runFullSync);
    runFullSync();
  }, []);

  const syncLock = useRef(false);
  const dbReady = useRef(false);

  //const runFullSync = useRef<() => Promise<void> | null>(null);

  const runFullSync = async () => {
    if (!dbReady.current || syncLock.current) return;

    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    syncLock.current = true;
    onSyncChange?.(true);

    try {
      const db = await getDb();
      await syncPendingScans();
      await syncPendingPicts();
      await danoCloudUpdate();
      console.log("Sync completado ✅");
    } catch (e) {
      console.error("SYNC ERROR:", e);
    } finally {
      onSyncChange?.(false);
      syncLock.current = false;
    }
  };

  useEffect(() => {
    (async () => {
      await initDB();
      dbReady.current = true;
      runFullSync?.();
    })();
  }, []);

  useEffect(() => {
    const appSub = AppState.addEventListener("change", state => {
      if (state === "active") runFullSync?.();
    });
    const netSub = NetInfo.addEventListener(state => {
      if (state.isConnected) runFullSync?.();
    });
    return () => {
      appSub.remove();
      netSub();
    };
  }, []);

  return null; // No renderiza nada
}
