import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'CODES_HISTORY'

export const saveCode = async (code) => {
	try {
		const existing = await AsyncStorage.getItem(STORAGE_KEY)
		const codes = existing ? JSON.parse(existing) : []
		codes.unshift(code) // agregar al inicio
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
	} catch (error) {
		console.error('Error al guardar código', error)
	}
}

export const getCodes = async () => {
	try {
		const saved = await AsyncStorage.getItem(STORAGE_KEY)
		return saved ? JSON.parse(saved) : []
	} catch (error) {
		return []
	}
}