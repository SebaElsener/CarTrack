import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { Appbar } from "react-native-paper";
import { useAuth } from '../../src/context/AuthContext';
import SyncManager from './SyncManager';

import CameraScreen from '../../src/screens/CameraScreen';
import ConsultaDanoScreen from '../../src/screens/ConsultaDanoScreen';
import DanoScreen from '../../src/screens/DanoScreen';
import HistoryScreen from '../../src/screens/HistoryScreen';
import HomeScreen from '../../src/screens/HomeScreen';
import Scanner from '../../src/screens/Scanner';
import ScannerScreen from '../../src/screens/ScannerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const { logout } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  return (
    <>
      {/* SyncManager raíz */}
		<SyncManager onSyncChange={setSyncing} />

      <Stack.Navigator screenOptions={{
        header: () => (
          <Appbar.Header>
            <Appbar.Action
              icon="home"
              onPress={() => router.replace("/(app)")}
            />
            <Appbar.Action icon="barcode-scan" onPress={() => router.replace("/(app)")} />
            {syncing && (
                  <LottieView
                    source={require("../../src/utils/Sync.json")}
                    autoPlay
                    loop
                    style={{ width: 34, height: 34, alignSelf: "center" }}
                  />
            )}
            <Appbar.Content title="" />
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
    </>
  );
}
