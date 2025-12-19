import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { View } from 'react-native';
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
    </>
  );
}
