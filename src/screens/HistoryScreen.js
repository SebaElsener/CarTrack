
import React, { useState, useEffect } from 'react';
import { View, FlatList, } from 'react-native';
import { getScans } from '../database/Database';
import ScanItem from '../components/ScanItem';

export default function HistoryScreen() {
  const [data, setData] = useState([]);

  const loadData = async () => {
    setData(await getScans())
  };

  useEffect(() => {
    loadData();
  }, [data]);

  return (
    <View style={{ flex: 1, padding: 15 }}>
      {/* <Button title="Eliminar todo" onPress={() => clearScans()} /> */}
 
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ScanItem
            item={item}
          />
        )}
      />
    </View>
  );
}