
import NetInfo from '@react-native-community/netinfo';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Appbar } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import { initDB } from '../../src/database/Database';
import CameraScreen from '../../src/screens/CameraScreen';
import DanoScreen from '../../src/screens/DanoScreen';
import HistoryScreen from '../../src/screens/HistoryScreen';
import HomeScreen from '../../src/screens/HomeScreen';
import ScannerScreen from '../../src/screens/ScannerScreen';
import { syncPendingPicts, syncPendingScans } from '../../src/services/sync';


const Stack = createNativeStackNavigator()
const router = useRouter()

export default function App() {

  const { logout } = useAuth();


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
		<Stack.Navigator screenOptions={{
			header: () => (
          		<Appbar.Header>
            		<Appbar.Content title="" />
					<Appbar.Action icon="home" onPress={()=>router.replace('/(app)')} />
            		<Appbar.Action icon="logout" onPress={logout} />
          		</Appbar.Header>
			)}}>
				<Stack.Screen name='Inicio' component={HomeScreen} />
				<Stack.Screen name='Escanear' component={ScannerScreen} />
        		<Stack.Screen name='Daños' component={DanoScreen} />
       			<Stack.Screen name='Fotos' component={CameraScreen} />
				<Stack.Screen name='Historial' component={HistoryScreen} />
			</Stack.Navigator>
	)
}