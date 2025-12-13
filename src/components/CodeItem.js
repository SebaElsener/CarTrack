
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function CodeItem({ item }) {
	return (
		<View style={styles.item}>
			<Text style={styles.data}>{item.data}</Text>
			<Text style={styles.type}>{item.type}</Text>
			<Text style={styles.date}>
				{new Date(item.date).toLocaleString()}
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	item: {
		backgroundColor: '#eee',
		padding: 15,
		marginBottom: 10,
		borderRadius: 8
	},
	data: { fontSize: 18, fontWeight: 'bold' },
	type: { color: '#555' },
	date: { color: '#777', marginTop: 5 }
})