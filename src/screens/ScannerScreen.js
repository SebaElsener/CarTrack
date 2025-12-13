
import { Camera, CameraView } from 'expo-camera'
import { useEffect, useState } from 'react'
import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import { getScan, saveScan } from '../database/Database'
import { syncPendingScans } from '../services/sync'

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
			await syncPendingScans()
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
          <Text style={styles.resultText}>{lastResult}</Text>

		  <View style={styles.button}>
			<Button title="Daños"
			    // buttonStyle={{ 
				// backgroundColor: 'rgba(222, 79, 79, 0.9)',
				// borderRadius: 5,
				// marginBottom: 15,
				// padding: 11 }}
				// titleStyle={{ fontSize: 20}}
				onPress={() => navigation.navigate("Daños", {lastResult})} />
		   </View>
		  <View style={styles.button}>
		    <Button title="Tomar fotos" 
			    // buttonStyle={{ 
				// backgroundColor: 'rgba(74, 119, 202, 0.93)',
				// borderRadius: 5,
				// marginBottom: 15,
				// padding: 11 }}
				// titleStyle={{ fontSize: 20}}
				onPress={() => navigation.navigate("Fotos", {lastResult})} />
          </View>
		  <View style={styles.button}>
		    <Button title="Escanear otro"
			    // buttonStyle={{ backgroundColor: 'rgba(75, 186, 44, 1)',
				// borderRadius: 5,
				// marginBottom: 15,
				// padding: 11 }}
				// titleStyle={{ fontSize: 20}}
				onPress={() => setScanned(false)} />
		  </View>
          <View style={styles.button}>
		    <Button title="Ver historial"
				// buttonStyle={{ 
				// backgroundColor: 'rgba(122, 134, 131, 0.88)',
				// borderRadius: 5,
				// padding: 11 }}
				// titleStyle={{ fontSize: 20}}
				onPress={() => navigation.navigate("Historial")} />
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
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: 'rgba(220, 220, 220, 1)',
    padding: 30,
    borderRadius: 8,
	height: 500
  },
  resultText: {
    marginBottom: 30,
    fontSize: 28,
	fontWeight: 'bold'
  },
  buttonText: {
	fontSize: 25
  }
})