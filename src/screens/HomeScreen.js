
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { clearScans } from '../database/Database';

export default function HomeScreen({ navigation }) {

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
			<Button style={styles.button}
				labelStyle={{ fontSize: 20 }}
				icon='camera'
				mode='elevated'
				buttonColor='rgba(126, 249, 128, 0.85)'
				textColor='rgba(42, 42, 42, 0.84)'
				onPress={() => navigation.navigate('Escanear')}
			>Escanear VIN
			</Button>

			<Button style={styles.button}
				labelStyle={{ fontSize: 20 }}
				icon='tablet'
				mode='elevated'
				buttonColor='rgba(143, 156, 143, 0.88)'
				textColor='rgba(42, 42, 42, 0.84)'
				onPress={() => navigation.navigate('Historial')}
			>Ver Historial
			</Button>
			<Button style={styles.button}
				labelStyle={{ fontSize: 20 }}
				icon='delete'
				mode='elevated'
				buttonColor='rgba(206, 104, 104, 0.7)'
				textColor='rgba(42, 42, 42, 0.84)'
				onPress={() => clearScans()}
			>Eliminar tablas
			</Button>
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
	},
	button: {
		padding: 8,
		width: 300,
	}
})