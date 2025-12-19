import NetInfo from '@react-native-community/netinfo';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { Appbar } from "react-native-paper";
import { useAuth } from '../../src/context/AuthContext';

import { initDB } from '../../src/database/Database';
import { danoCloudUpdate, syncPendingPicts, syncPendingScans } from '../../src/services/sync';

import CameraScreen from '../../src/screens/CameraScreen';
import ConsultaDanoScreen from '../../src/screens/ConsultaDanoScreen';
import DanoScreen from '../../src/screens/DanoScreen';
import HistoryScreen from '../../src/screens/HistoryScreen';
import HomeScreen from '../../src/screens/HomeScreen';
import Scanner from '../../src/screens/Scanner';
import ScannerScreen from '../../src/screens/ScannerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const router = useRouter();
  const { logout } = useAuth();

  const [syncing, setSyncing] = useState(false);
  const [DBReady, setDBReady] = useState(false);

  let syncLock = false;

  const runFullSync = async () => {
    if (syncLock || !DBReady) return;
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    syncLock = true;
    setSyncing(true);

    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
      try {
        await syncPendingScans();
        await syncPendingPicts();
        await danoCloudUpdate();
        break;
      } catch (e) {
        attempt++;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }

    setSyncing(false);
    syncLock = false;
  };

  // Inicialización DB y sync inicial
  useEffect(() => {
    (async () => {
      try {
        await initDB();
		setDBReady(true);
        const state = await NetInfo.fetch();
        if (state.isConnected) await runFullSync();
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Sync al volver al foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", state => {
      if (state === "active") runFullSync();
    });
	runFullSync()
    return () => sub.remove();
  }, [DBReady]);

  // Sync al cambiar conectividad
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected) runFullSync();
    });
	runFullSync()
    return () => unsub();
  }, [DBReady]);

  return (
    <Stack.Navigator screenOptions={{
      header: () => (
        <Appbar.Header>
          <Appbar.Content title="" />
          {syncing && (
            <View style={{ width: 40, height: 40, marginRight: 10 }}>
              <LottieView
                source={require("../../src/utils/Sync.json")}
                autoPlay
                loop
              />
            </View>
          )}
          <Appbar.Action icon="home" onPress={() => router.replace('/(app)')} />
          <Appbar.Action icon="logout" onPress={logout} />
        </Appbar.Header>
      )
    }}>
      <Stack.Screen name='Inicio' component={HomeScreen} />
      <Stack.Screen name='Escanear' component={ScannerScreen} />
      <Stack.Screen name='Daños' component={DanoScreen} />
      <Stack.Screen name='Fotos' component={CameraScreen} />
      <Stack.Screen name='ConsultaDano' component={ConsultaDanoScreen} />
      <Stack.Screen name='Scanner' component={Scanner} />
      <Stack.Screen name='Historial' component={HistoryScreen} />
    </Stack.Navigator>
  );
}
