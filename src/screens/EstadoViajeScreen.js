import { Picker } from "@react-native-picker/picker";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { getDb } from "../database/Database";
import { getMovimientosByEquipo } from "../services/CRUD";

export default function EstadoViajeScreen() {
  const { operator } = useAuth();

  const [movimientos, setMovimientos] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [viajeFiltro, setViajeFiltro] = useState("ALL");
  const [lastScanVin, setLastScanVin] = useState(null);

  //const [soloPendientes, setSoloPendientes] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [modalInfo, setModalInfo] = useState(null);
  const [viajesNotificados, setViajesNotificados] = useState([]);

  const loadingRef = useRef(false);

  useEffect(() => {
    if (!viajesEstado || Object.keys(viajesEstado).length === 0) return;
    for (const viaje of Object.keys(viajesEstado)) {
      if (viajesNotificados.includes(viaje)) continue;

      const estado = viajesEstado[viaje];

      if (estado.total === estado.descargas) {
        setModalInfo({ viaje, tipo: "DESCARGA" });
        setViajesNotificados((prev) => [...prev, viaje]);
        break;
      }

      if (estado.total === estado.cargas) {
        setModalInfo({ viaje, tipo: "CARGA" });
        setViajesNotificados((prev) => [...prev, viaje]);
        break;
      }
    }
  }, [viajesEstado]);

  // 🔒 Landscape
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => ScreenOrientation.unlockAsync();
  }, []);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    //NavigationBar.setBehaviorAsync("overlay-swipe");

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
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      // ---------------------------
      // 🔹 Movimientos (Supabase)
      // ---------------------------
      const result = await getMovimientosByEquipo(operator.transport_nbr);

      if (!result.ok) {
        throw new Error("Error obteniendo movimientos");
      }

      setMovimientos(result.data || []);

      // ---------------------------
      // 🔹 Scans (SQLite local)
      // ---------------------------
      const db = await getDb();

      const localScans = await db.getAllAsync(
        `SELECT vin, movimiento FROM scans WHERE transport_nbr = ?`,
        [operator.transport_nbr],
      );

      const scansSafe = localScans || [];

      setScans(scansSafe);

      // ---------------------------
      // 🔹 Último scan (highlight)
      // ---------------------------
      if (scansSafe.length > 0) {
        const last = scansSafe[scansSafe.length - 1];
        setLastScanVin(last.vin);
      } else {
        setLastScanVin(null);
      }
    } catch (error) {
      console.error("Error en loadData:", error);

      // 🔥 fallback seguro
      setMovimientos([]);
      setScans([]);
      setLastScanVin(null);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // ---------------------------
  // Viajes únicos
  // ---------------------------
  const viajes = useMemo(() => {
    const unique = [...new Set(movimientos.map((m) => m.idtviaje))];
    return unique;
  }, [movimientos]);

  const scanMap = useMemo(() => {
    const map = {};

    scans.forEach((s) => {
      const vin = s.vin;

      if (!map[vin]) {
        map[vin] = { carga: false, descarga: false };
      }

      if (s.movimiento === "CARGA") map[vin].carga = true;
      if (s.movimiento === "DESCARGA") map[vin].descarga = true;
    });

    return map;
  }, [scans]);

  // ---------------------------
  // Merge + filtros
  // ---------------------------
  const data = useMemo(() => {
    return movimientos.map((mov) => {
      const estado = scanMap[mov.vin] || {};

      return {
        ...mov,
        carga: estado.carga || false,
        descarga: estado.descarga || false,
      };
    });
  }, [movimientos, scanMap]);

  const filteredData = useMemo(() => {
    const searchClean = search.trim().toUpperCase();

    return data
      .filter((item) => {
        if (viajeFiltro !== "ALL" && item.idtviaje !== viajeFiltro)
          return false;

        if (searchClean && !item.vin.includes(searchClean)) return false;

        if (filtroEstado === "CARGA") return !item.carga;

        if (filtroEstado === "DESCARGA") return item.carga && !item.descarga;

        return true;
      })
      .sort((a, b) => {
        const score = (x) => {
          if (!x.carga) return 0;
          if (x.carga && !x.descarga) return 1;
          return 2;
        };

        const diff = score(a) - score(b);
        if (diff !== 0) return diff;

        return a.vin.localeCompare(b.vin);
      });
  }, [data, search, viajeFiltro, filtroEstado]);

  const viajesEstado = useMemo(() => {
    const map = {};

    movimientos.forEach((mov) => {
      if (!map[mov.idtviaje]) {
        map[mov.idtviaje] = {
          total: 0,
          cargas: 0,
          descargas: 0,
        };
      }

      map[mov.idtviaje].total += 1;

      const estado = scanMap[mov.vin];

      if (estado?.carga) map[mov.idtviaje].cargas += 1;
      if (estado?.descarga) map[mov.idtviaje].descargas += 1;
    });

    return map;
  }, [movimientos, scanMap]);

  const viajesCargaCompleta = Object.entries(viajesEstado)
    .filter(([_, v]) => v.cargas === v.total)
    .map(([id]) => id);

  const viajesDescargaCompleta = Object.entries(viajesEstado)
    .filter(([_, v]) => v.descargas === v.total && v.cargas === v.total)
    .map(([id]) => id);

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
    // const completed =
    //   item.carga && item.descarga && !isCargaCompleta && !isDescargaCompleta;
    // const isLast = item.vin === lastScanVin;

    const isCargaCompleta = viajesCargaCompleta.includes(item.idtviaje);
    const isDescargaCompleta = viajesDescargaCompleta.includes(item.idtviaje);

    const isLast = item.vin === lastScanVin;

    // let rowBg = styles.row;

    // if (isDescargaCompleta) {
    //   rowBg = styles.rowDescargaCompleta;
    // } else if (isCargaCompleta) {
    //   rowBg = styles.rowCargaCompleta;
    // } else if (item.carga && item.descarga) {
    //   rowBg = styles.rowCompleted;
    // }

    const getRowStyle = () => {
      if (isLast && !isDescargaCompleta && !isCargaCompleta) {
        return [styles.row, styles.rowHighlight];
      }

      if (isDescargaCompleta) {
        return [styles.row, styles.rowDescargaCompleta];
      }

      if (isCargaCompleta) {
        return [styles.row, styles.rowCargaCompleta];
      }

      if (item.carga && item.descarga) {
        return [styles.row, styles.rowCompleted];
      }

      return [styles.row];
    };

    return (
      <View style={getRowStyle()}>
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

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={viajeFiltro}
            style={styles.picker}
            onValueChange={(itemValue) => setViajeFiltro(itemValue)}
            dropdownIconColor="#333"
            mode="dropdown"
          >
            <Picker.Item label="Viajes" value="ALL" />
            {viajes.map((v) => (
              <Picker.Item key={v} label={v.slice(-8)} value={v} />
            ))}
          </Picker>
        </View>

        <View style={styles.stats}>
          {/* <Text style={styles.stat}>TOTAL: {stats.total}</Text> */}
          <Text style={styles.stat}>CARGA: {stats.cargados}</Text>
          <Text style={styles.stat}>DESC: {stats.descargados}</Text>
          <Text style={styles.stat}>PEND: {stats.pendientes}</Text>
        </View>
      </View>

      {/* 📊 TABLA */}
      <View style={{ flex: 1 }}>
        <TableHeader />
        <FlatList
          data={filteredData}
          extraData={lastScanVin}
          keyExtractor={(item) => item.vin}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={loadData}
          removeClippedSubviews={false}
          //contentContainerStyle={{ paddingBottom: 80 }}
          style={{ flex: 1 }}
        />
      </View>

      <Portal>
        <Dialog visible={!!modalInfo}>
          <Dialog.Title style={{ textAlign: "center" }}>
            OPERACIÓN COMPLETA
          </Dialog.Title>

          <Dialog.Content>
            <Text style={{ textAlign: "center", fontSize: 18 }}>
              {modalInfo?.tipo} COMPLETA
            </Text>

            <Text style={{ textAlign: "center", marginTop: 10 }}>
              VIAJE {modalInfo?.viaje}
            </Text>
          </Dialog.Content>

          <Dialog.Actions style={{ justifyContent: "center" }}>
            <Button onPress={() => setModalInfo(null)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 10,
    borderRadius: 6,
    width: 200,
    height: 38,
  },

  pickerWrapper: {
    height: 40,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
    //borderWidth: 1,
    //borderColor: "#bbb",
    paddingHorizontal: 5,
    justifyContent: "center",
  },

  picker: {
    width: 150,
    color: "#121111",
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
    backgroundColor: "#1e1d1de7",
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

  rowCargaCompleta: {
    backgroundColor: "#2597e9", // azul claro
  },

  rowDescargaCompleta: {
    backgroundColor: "#0cce13f7", // verde claro
  },
});
