

import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/context/AuthContext';
import { initDB } from '../src/database/Database';
import { syncPendingPicts, syncPendingScans } from '../src/services/sync';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from '../src/screens/CameraScreen';
import DanoScreen from '../src/screens/DanoScreen';
import HistoryScreen from '../src/screens/HistoryScreen';
import HomeScreen from '../src/screens/HomeScreen';
import LoginScreen from '../src/screens/LoginScreen';
import ScannerScreen from '../src/screens/ScannerScreen';

const Stack = createNativeStackNavigator()

export default function App() {

	useEffect(() => {
    	initDB();
    }, []);

	// Sincronizar si hay conexión
	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
		if (state.isConnected) {
	  		syncPendingScans()
			syncPendingPicts()
		}
  	});
  	return () => unsubscribe();
	}, [])

	return (
			<AuthProvider>
			<PaperProvider>
			<Stack.Navigator>
				<Stack.Screen name='Login' component={LoginScreen} />
				<Stack.Screen name='Inicio' component={HomeScreen} />
				<Stack.Screen name='Escanear' component={ScannerScreen} />
        		<Stack.Screen name='Daños' component={DanoScreen} />
       			<Stack.Screen name='Fotos' component={CameraScreen} />
				<Stack.Screen name='Historial' component={HistoryScreen} />
			</Stack.Navigator>
			</PaperProvider>
			</AuthProvider>

	)
}