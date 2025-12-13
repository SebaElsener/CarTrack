
import { Button, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { clearScans } from '../database/Database';

export default function HomeScreen({ navigation }) {

	// useEffect(() => {
    // 	initDB();
    // }, []);

	// // Sincronizar si hay conexión
	// useEffect(() => {
	// 	const unsubscribe = NetInfo.addEventListener(state => {
	// 	if (state.isConnected) {
	//   		syncPendingScans()
	// 		syncPendingPicts()
	// 	}
  	// });

  	// return () => unsubscribe();
	// }, [])

	return (
		<View style={ styles.backContainer }>
			<ImageBackground
				style={ styles.backImage }
				imageStyle={{opacity: 0.35}}
				source={require('../utils/depositphotos_77241976.jpg')}>
			<View style={styles.titleContainer}>
	  		<Text style={styles.title}>Car<Text style={styles.titleSpan}>Track</Text></Text>

			</View>
		
		<View style={styles.container}>
			<Button
				buttonStyle={{ 
				backgroundColor: 'rgba(75, 186, 44, 0.73)',
                borderRadius: 5,
				width: 320,
				padding: 20}}
				titleStyle={{ fontSize: 28}}
				title='📷  Escanear VIN'
				onPress={() => navigation.navigate('Escanear')}
			/>

			<Button
				title='📜  Ver Historial'
				buttonStyle={{ 
				backgroundColor: 'rgba(122, 134, 131, 0.7)',
                borderRadius: 5,
				width: 320,
				padding: 20}}
				titleStyle={{ fontSize: 28}}
				onPress={() => navigation.navigate('Historial')}
			/>
			<Button
				buttonStyle={{ 
				backgroundColor: 'rgba(242, 82, 82, 0.73)',
                borderRadius: 5,
				width: 320,
				padding: 20}}
				titleStyle={{ fontSize: 28}}
				title='❌​ Eliminar tablas'
				onPress={() => clearScans()}
			/>
		</View>
		</ImageBackground>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { justifyContent: 'space-evenly', alignItems: 'center', height: 380, top: 150 },
	title: { fontSize: 38, color: 'rgba(77, 77, 77, 0.84)', fontWeight: 'bold' },
	titleContainer: {
		alignItems: 'center',
		top: 40
	},
	titleSpan: {
		fontStyle: 'italic',
		color: 'rgba(214, 53, 53, 0.8)'
	},
	backImage: {
		flex: 1,
		width: null,
		height: null		
	},
	backContainer: {
		minHeight: '100%'
	}
})