
import { Camera, CameraView } from 'expo-camera'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { getScan, saveScan } from '../database/Database'

export default function ScannerScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null)
    const [scanned, setScanned] = useState(false)
	const [lastResult, setLastResult] = useState("")

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            setHasPermission(status === 'granted')
        }

        getCameraPermissions()
    }, [])

	const scanExistsAlert = (vin) => {
		Alert.alert('VIN EXISTENTE', vin, [
			{
				text: 'IR A HISTORIAL',
				style: 'default',
				onPress: ()=> { navigation.navigate("Historial") }
			},
			{
				text: 'VOLVER',
				style: 'default',
			}
		])
	}

	const handleScan = async ({ type, data }) => {
		setScanned(true)
		setLastResult(`${data}`)
		
		const alreadyScanned = await getScan(data)

		if (!alreadyScanned) {
			await saveScan(data, type)
//			await syncPendingScans()
		}
		  else {
			scanExistsAlert(data)
		}
	}

	if (hasPermission === null) return <Text>Solicitando permisos...</Text>
	if (hasPermission === false)
		return <Text>No se tiene permiso de cámara</Text>

	return (

	<View style={styles.container}>

		 	<CameraView
				onBarcodeScanned={scanned ? undefined : handleScan}
		 		// barcodeScannerSettings={{
		 		// 	barcodeTypes: ['qr', 'code128']
				// }}
		 		style={StyleSheet.absoluteFillObject}
		 	/>

      {scanned && (
		
        <View style={styles.result}>
		  <View style={ styles.titleContainer}>
            <Text style={styles.resultText}>{lastResult}</Text>
		  </View>
		  <View style={styles.button}>
			<Button 
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='contained-tonal'
				buttonColor='rgba(222, 101, 101, 0.95)'
				textColor='rgba(41, 30, 30, 0.89)'
				onPress={() => navigation.navigate("Daños", {lastResult})} >
				Daños
			</Button>
		   </View>
		  <View style={styles.button}>
		    <Button
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='elevated'
				buttonColor='rgba(104, 137, 198, 0.93)'
				textColor='rgba(41, 30, 30, 0.89)'
				onPress={() => navigation.navigate("Fotos", {lastResult})} >
				Tomar fotos
			</Button>
          </View>
		  <View style={styles.button}>
		    <Button title="Escanear otro"
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='elevated'
				buttonColor='rgba(115, 175, 98, 1)'
				textColor='rgba(41, 30, 30, 0.89)'
				onPress={() => setScanned(false)}>
				Escanear otro
			</Button>
		  </View>
          <View style={styles.button}>
		    <Button
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='elevated'
				buttonColor='rgba(122, 134, 131, 0.88)'
				textColor='rgba(41, 30, 30, 0.89)'
				onPress={() => navigation.navigate("Historial")}>
				Ver historial
			</Button>
		  </View>

        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  result: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    backgroundColor: 'rgba(220, 220, 220, 1)',
    padding: 30,
    borderRadius: 8,
	height: 450
  },
  resultText: {
    marginBottom: 30,
    fontSize: 23,
	fontWeight: 'bold',
	color: 'rgba(47, 47, 47, 0.89)',
  },
  button: {
	marginTop: 20
  },
  titleContainer: {
	borderBottomWidth: 1,
	borderBottomColor: '#737171ef',
	marginBottom: 16
  }
})