import { registerSyncTrigger } from "@/src/services/syncTrigger";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { getDb, initDB } from "../../src/database/Database";
import {
  danoCloudUpdate,
  syncPendingPicts,
  syncPendingScans,
} from "../../src/services/sync";

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
  let isSyncing = false;
  let retryTimeout: number | null = null;
  const RETRY_DELAY = 15_000;

  const runFullSync = async () => {
    if (!dbReady.current || syncLock.current) return;

    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    if (isSyncing) return;

    isSyncing = true;
    console.log("🔄 Sync started");

    syncLock.current = true;
    onSyncChange?.(true);

    try {
      const db = await getDb();
      const pendingScans = await syncPendingScans();
      const pendingPicts = await syncPendingPicts();
      const pendingDanos = await danoCloudUpdate();

      if (pendingScans === 0 && pendingPicts === 0 && pendingDanos === 0) {
        console.log("✅ Sync complete");
        stopRetry();
      } else {
        scheduleRetry();
      }
      console.log("Sync completado ✅");
    } catch (e) {
      console.error("SYNC ERROR:", e);
      scheduleRetry();
    } finally {
      onSyncChange?.(false);
      syncLock.current = false;
      isSyncing = false;
    }
  };

  function scheduleRetry() {
    if (retryTimeout) return;

    retryTimeout = setTimeout(() => {
      retryTimeout = null;
      runFullSync();
    }, RETRY_DELAY);

    console.log("⏳ Retry scheduled");
  }

  function stopRetry() {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  }

  useEffect(() => {
    (async () => {
      await initDB();
      dbReady.current = true;
      runFullSync?.();
    })();
  }, []);

  useEffect(() => {
    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "active") runFullSync?.();
    });
    const netSub = NetInfo.addEventListener((state) => {
      if (state.isConnected) runFullSync?.();
    });
    return () => {
      appSub.remove();
      netSub();
    };
  }, []);

  return null; // No renderiza nada
}
