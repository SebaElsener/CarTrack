import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import ConsultaDanoItem from '../components/ConsultaDanoItem';
import { fetchDamageInfo, fetchPicts } from '../services/CRUD';

export default function ConsultaDanoScreen({ navigation, route }) {
  const [data, setData] = useState([]);
  const [picts, setPicts] = useState([]);
  const [vin, setVin] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [hasInteracted, setHasInteracted] = useState(false);

  // 👉 Cargar VIN desde el scanner (UNA sola vez)
  useEffect(() => {
    if (route.params?.lastResult) {
      setVin(route.params.lastResult);
      setHasSearched(true);
    }
  }, [route.params?.lastResult]);

  // 👉 Ejecutar búsqueda cuando cambia el VIN y ya hubo búsqueda
  useEffect(() => {
    if (hasSearched && vin) {
      loadData()
      getPicts()
    }
  }, [vin, hasSearched]);

  const loadData = async () => {
    if (!vin) return;
    try {
      setLoading(true);
      const damageData = await fetchDamageInfo(vin);
      setData(damageData); // incluso si viene []
    } catch (error) {
      console.error('Error fetching damage data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

    const getPicts = async () => {
    if (!vin) return;
    try {
      setLoading(true);
      const pictsData = await fetchPicts(vin);
      setPicts(pictsData); // incluso si viene []
    } catch (error) {
      console.error('Error fetching damage data:', error);
      setPicts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta de Daños por VIN</Text>

      <TextInput
        value={vin}
        label="Ingresar VIN"
        maxLength={17}
        mode="outlined"
        style={styles.input}
        onFocus={() => {
          setVin('');
          setHasInteracted(true);
        }}
        autoCapitalize="characters"
        onChangeText={(text) => setVin(text.toUpperCase())}
      />

      {hasInteracted && vin.length !== 17 && (
        <Text style={{ color: 'red', marginTop: 5 }}>
          VIN incompleto ({vin.length}/17)
        </Text>
      )}

      <Button
        mode="contained"
        onPress={() => {
          setHasSearched(true);
          loadData();
        }}
        disabled={vin.length !== 17}
        style={styles.button}
      >
        Consultar
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Scanner')}
        style={styles.button}
      >
        Escanear
      </Button>

      <View style={styles.cardContainer}>
        {loading && <ActivityIndicator size="large" />}

        {!loading && hasSearched && (
          data.length > 0 ? (
            <FlatList
              data={data}
              keyExtractor={(item) => item.supabase_id.toString()}
              renderItem={({ item }) => (
                <ConsultaDanoItem item={item} />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No se encontraron daños para el VIN proporcionado
                </Text>
              }
            />
          ) : (
            <Text style={styles.emptyText}>
              No se encontraron daños para el VIN proporcionado
            </Text>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    marginTop: 15,
  },
  button: {
    marginTop: 15,
  },
  cardContainer: {
    flex: 1,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    opacity: 0.7,
  },
});