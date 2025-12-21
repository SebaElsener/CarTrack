
import { Camera, CameraView } from 'expo-camera'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import playSound from "../components/plySound"
import { getScan, saveScan } from '../database/Database'
import { requestSync } from "../services/syncTrigger"

const router = useRouter()

	///  Area de escaneo
	const { width, height } = Dimensions.get('window');
	const SCAN_SIZE = width * 0.7;
	const TOP = (height - SCAN_SIZE) / 2;
	const LEFT = (width - SCAN_SIZE) / 2;

  const VIN_MAP = {
  A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8,
  J:1, K:2, L:3, M:4, N:5, P:7, R:9,
  S:2, T:3, U:4, V:5, W:6, X:7, Y:8, Z:9,
  0:0, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9,
};

const VIN_WEIGHTS = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];

export function isValidVIN(vin) {
  if (!vin || vin.length !== 17) return false;
  if (/[IOQ]/.test(vin)) return false;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += VIN_MAP[vin[i]] * VIN_WEIGHTS[i];
  }

  const check = sum % 11;
  const checkChar = check === 10 ? 'X' : String(check);

  return vin[8] === checkChar;
}

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
	const [lastResult, setLastResult] = useState("")
	const scanLineAnim = useRef(new Animated.Value(0)).current;
	const [torch, setTorch] = useState(false);
  const [aligned, setAligned] = useState(false);
  const scanLock = useRef(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            setHasPermission(status === 'granted')
        }

        getCameraPermissions()
    }, [])

	  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: SCAN_SIZE - 4,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

	// const scanExistsAlert = (vin) => {
	// 	Alert.alert('VIN EXISTENTE', vin, [
	// 		{
	// 			text: 'IR A HISTORIAL',
	// 			style: 'default',
	// 			onPress: ()=> { router.replace("/(app)/HistoryScreen") }
	// 		},
	// 		{
	// 			text: 'VOLVER',
	// 			style: 'default',
	// 		}
	// 	])
	// }

	const handleScan = async ({ cornerPoints, type, data }) => {
  if (!cornerPoints || scanLock.current) return;
  if (!data || data.length < 6) return;

  const centerX =
    cornerPoints.reduce((s, p) => s + p.x, 0) / cornerPoints.length;
  const centerY =
    cornerPoints.reduce((s, p) => s + p.y, 0) / cornerPoints.length;

  const inside =
    centerX > LEFT &&
    centerX < LEFT + SCAN_SIZE &&
    centerY > TOP &&
    centerY < TOP + SCAN_SIZE;

  setAligned(inside);

    if (!inside) return;

      scanLock.current = true;

        const vin = data.trim().toUpperCase();

  if (!isValidVIN(vin)) {
    await playSound('error');
    scanLock.current = false;
    return;
  }

  setScanned(true);
  setLastResult(vin);
  Vibration.vibrate(120);


		const alreadyScanned = await getScan(vin)

		if (!alreadyScanned) {
      await playSound('success');      	
			await saveScan(vin, type)
      requestSync()
      setTimeout(() => {
      scanLock.current = false;
      setAligned(false)
  }, 1200)
		}
		  else {
			await playSound('error')
      router.push({
        pathname: '/(app)/HistoryScreen',
        params: {vin: vin}
      })
		}
	}

	if (hasPermission === null) return <Text>Solicitando permisos...</Text>
	if (hasPermission === false)
		return <Text>No se tiene permiso de cámara</Text>

	return (

	<View style={styles.container}>

		 	<CameraView
				onBarcodeScanned={scanned ? undefined : handleScan}
		 		style={StyleSheet.absoluteFillObject}
        autoFocus={false}
				//flashMode={torch ? 2 : 0} // 2 = torch, 0 = off
		 	/>
	  <TouchableOpacity
        style={styles.flashButton}
        onPress={() => setTorch(!torch)}
      >
        <Text style={styles.flashText}>{torch ? '🔦 OFF' : '🔦 ON'}</Text>
      </TouchableOpacity>
        <Text style={styles.helperText}>
          Alinee el código dentro del marco
        </Text>

	        {/* Overlay */}
      <View style={styles.overlay}>
        <View style={[styles.mask, { height: TOP }]} />

        <View style={styles.centerRow}>
          <View style={[styles.mask, { width: LEFT }]} />

          <View style={[
            styles.scanArea,
                {
                  borderColor: aligned ? '#00ff88' : 'rgba(255,255,255,0.3)',
                  borderWidth: 2,
                },
          ]}>
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineAnim }] },
              ]}
            />
            <View style={[styles.corner, styles.topLeft]} ></View>
            <View style={[styles.corner, styles.topRight]} ></View>
            <View style={[styles.corner, styles.bottomLeft]} ></View>
            <View style={[styles.corner, styles.bottomRight]} ></View>
          </View>

          <View style={[styles.mask, { width: LEFT }]} />
        </View>
        <View style={[styles.mask, { height: TOP }]} />
      </View>

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
				onPress={() => router.replace({
                         pathname: "/(app)/DanoScreen",
                         params: {
                          lastResult
                         }
                       })
                }
      >
				Daños
			</Button>
		   </View>
		  <View style={styles.button}>
		    <Button
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='elevated'
				buttonColor='rgba(104, 137, 198, 0.93)'
				textColor='rgba(41, 30, 30, 0.89)'
				onPress={() => router.replace({
                         pathname: "/(app)/CameraScreen",
                         params: {
                          lastResult
                         }
                       })} >
				Tomar fotos
			</Button>
          </View>
		  <View style={styles.button}>
		    <Button title="Escanear otro"
				labelStyle={{ fontSize: 20, padding: 5 }}
				mode='elevated'
				buttonColor='rgba(115, 175, 98, 1)'
				textColor='rgba(41, 30, 30, 0.89)'
				onPress={() => {setScanned(false)
                        scanLock.current = false
                        setAligned(false)
          }}>
				Escanear otro
			</Button>
		  </View>
      {/* <View style={styles.button}>
		    <Button
          labelStyle={{ fontSize: 20, padding: 5 }}
          mode='elevated'
          buttonColor='rgba(122, 134, 131, 0.88)'
          textColor='rgba(41, 30, 30, 0.89)'
          onPress={() => router.push({
            pathname: '/(app)/HistoryScreen',
            params: {vin: lastResult}
          })}>
          Ver historial
			</Button> */}
		  {/* </View> */}

        </View>
      )}
    </View>
  )
}

const CORNER = 28

const styles = StyleSheet.create({
  container: { flex: 1 },
  result: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    backgroundColor: 'rgba(220, 220, 220, 1)',
    padding: 30,
    borderRadius: 8,
	  height: 400
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
  },
    overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  mask: { backgroundColor: 'rgba(0,0,0,0.6)' },
  centerRow: { flexDirection: 'row' },
  scanArea: { width: SCAN_SIZE, height: SCAN_SIZE, position: 'relative' },
  scanLine: { height: 2, width: '100%', backgroundColor: '#00ff88' },
  helperText: { 
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
    zIndex: 20
  },
  flashButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  flashText: { color: '#fff', fontSize: 14 },

  // Esquinas tipo L
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#00ff88' },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }
})