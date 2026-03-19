import { Picker } from "@react-native-picker/picker";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getDb } from "../database/Database";
import { getMovimientosByEquipo } from "../services/CRUD";

export default function EstadoViajeScreen() {
  const { operator } = useAuth();

  const [movimientos, setMovimientos] = useState([]);
  const [scans, setScans] = useState([]);

  const [search, setSearch] = useState("");
  const [viajeFiltro, setViajeFiltro] = useState("ALL");
  const [lastScanVin, setLastScanVin] = useState(null);

  //const [soloPendientes, setSoloPendientes] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // 🔒 Landscape
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => ScreenOrientation.unlockAsync();
  }, []);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

    return () => {
      NavigationBar.setVisibilityAsync("visible"); // 👈 restaurar al salir
    };
  }, []);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

    return () => {
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  // ---------------------------
  // Cargar datos
  // ---------------------------
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const result = await getMovimientosByEquipo(operator.transport_nbr);

    if (result.ok) setMovimientos(result.data);

    const db = await getDb();
    const localScans = await db.getAllAsync(
      `SELECT vin, movimiento FROM scans WHERE transport_nbr = ?`,
      [operator.transport_nbr],
    );

    setScans(localScans || []);

    // 🔥 último scan (para highlight)
    const last = localScans[localScans.length - 1];
    if (last) setLastScanVin(last.vin);
  };

  // ---------------------------
  // Viajes únicos
  // ---------------------------
  const viajes = useMemo(() => {
    const unique = [...new Set(movimientos.map((m) => m.idtviaje))];
    return unique;
  }, [movimientos]);

  // ---------------------------
  // Merge + filtros
  // ---------------------------
  const data = useMemo(() => {
    return movimientos
      .map((mov) => {
        const carga = scans.some(
          (s) => s.vin === mov.vin && s.movimiento === "CARGA",
        );

        const descarga = scans.some(
          (s) => s.vin === mov.vin && s.movimiento === "DESCARGA",
        );

        return {
          ...mov,
          carga,
          descarga,
        };
      })
      .filter((item) => {
        if (viajeFiltro !== "ALL" && item.idtviaje !== viajeFiltro)
          return false;

        if (search && !item.vin.includes(search.toUpperCase())) return false;

        // 🔥 FILTRO TRIPLE CORREGIDO
        switch (filtroEstado) {
          case "CARGA":
            return !item.carga;

          case "DESCARGA":
            return item.carga && !item.descarga;

          case "TODOS":
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const score = (x) => {
          if (!x.carga) return 0;
          if (x.carga && !x.descarga) return 1;
          return 2;
        };
        return score(a) - score(b);
      });
  }, [movimientos, scans, search, viajeFiltro, filtroEstado]);

  // ---------------------------
  // Stats
  // ---------------------------
  const stats = useMemo(() => {
    const total = data.length;
    const cargados = data.filter((d) => d.carga).length;
    const descargados = data.filter((d) => d.descarga).length;
    const pendientes = total - descargados;

    return { total, cargados, descargados, pendientes };
  }, [data]);

  // ---------------------------
  // Header
  // ---------------------------
  const TableHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerCell, styles.colVin]}>VIN</Text>
      <Text style={styles.headerCell}>VIAJE</Text>
      <Text style={styles.headerCell}>ORIGEN</Text>
      <Text style={styles.headerCell}>DESTINO</Text>
      <Text style={styles.headerCell}>CARGA</Text>
      <Text style={styles.headerCell}>DESCARGA</Text>
    </View>
  );

  // ---------------------------
  // Row
  // ---------------------------
  const renderItem = ({ item }) => {
    const completed = item.carga && item.descarga;
    const isLast = item.vin === lastScanVin;

    return (
      <View
        style={[
          styles.row,
          completed && styles.rowCompleted,
          isLast && styles.rowHighlight,
        ]}
      >
        <Text style={[styles.cell, styles.colVin]}>{item.vin}</Text>
        <Text style={styles.cell}>{item.idtviaje}</Text>
        <Text style={styles.cell}>{item.nombreorigen}</Text>
        <Text style={styles.cell}>{item.nombredestino}</Text>

        <Text style={[styles.cell, item.carga && styles.ok]}>
          {item.carga ? "✔" : "-"}
        </Text>

        <Text style={[styles.cell, item.descarga && styles.ok]}>
          {item.descarga ? "✔" : "-"}
        </Text>
      </View>
    );
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* 🔍 FILTROS */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="Buscar VIN..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setFiltroEstado("TODOS")}
            style={[
              styles.toggleBtn,
              filtroEstado === "TODOS" && styles.toggleActive,
            ]}
          >
            <Text style={styles.toggleText}>TODOS</Text>
          </Pressable>

          <Pressable
            onPress={() => setFiltroEstado("CARGA")}
            style={[
              styles.toggleBtn,
              filtroEstado === "CARGA" && styles.toggleActive,
            ]}
          >
            <Text style={styles.toggleText}>CARGA</Text>
          </Pressable>

          <Pressable
            onPress={() => setFiltroEstado("DESCARGA")}
            style={[
              styles.toggleBtn,
              filtroEstado === "DESCARGA" && styles.toggleActive,
            ]}
          >
            <Text style={styles.toggleText}>DESCARGA</Text>
          </Pressable>
        </View>

        <Picker
          selectedValue={viajeFiltro}
          style={styles.picker}
          onValueChange={(itemValue) => setViajeFiltro(itemValue)}
        >
          <Picker.Item label="Viajes" value="ALL" />
          {viajes.map((v) => (
            <Picker.Item key={v} label={v.slice(-5)} value={v} />
          ))}
        </Picker>

        <View style={styles.stats}>
          {/* <Text style={styles.stat}>TOTAL: {stats.total}</Text> */}
          <Text style={styles.stat}>CARGA: {stats.cargados}</Text>
          <Text style={styles.stat}>DESC: {stats.descargados}</Text>
          <Text style={styles.stat}>PEND: {stats.pendientes}</Text>
        </View>
      </View>

      {/* 📊 TABLA */}
      <ScrollView horizontal>
        <View>
          <TableHeader />

          <FlatList
            data={data}
            keyExtractor={(item) => item.vin}
            renderItem={renderItem}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    //padding: 8,
    gap: 10,
  },

  search: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 6,
    width: 200,
  },

  picker: {
    width: 120,
    backgroundColor: "#fff",
  },

  stats: {
    flexDirection: "row",
    gap: 10,
    //marginLeft: "auto",
  },

  stat: {
    fontWeight: "bold",
  },

  header: {
    flexDirection: "row",
    backgroundColor: "#111",
    paddingVertical: 10,
  },

  headerCell: {
    width: 120,
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
  },

  colVin: {
    width: 220,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },

  rowCompleted: {
    backgroundColor: "#d4edda",
  },

  rowHighlight: {
    backgroundColor: "#fff3cd", // amarillo último scan
  },

  cell: {
    width: 120,
    fontSize: 13,
    textAlign: "center",
  },

  ok: {
    color: "green",
    fontWeight: "bold",
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#ccc",
  },

  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#e0e0e0",
  },

  toggleActive: {
    backgroundColor: "#1976d2",
  },

  toggleText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },

  toggleTextActive: {
    color: "#fff",
  },
});
