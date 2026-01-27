import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { markToDelete } from "../database/Database";
import { requestSync } from "../services/syncTrigger";
import ConsultaDanoItem from "./ConsultaDanoItem";

function ScanItem({ item, localPicts, isActive, onDelete, renderVin }) {
  const router = useRouter();
  const [damagesState, setDamagesState] = useState([]); // solo para animaciones
  const [pulseLocked, setPulseLocked] = useState(false);
  const pulseTimeoutRef = useRef(null);

  const [damaged, setDamaged] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const danosAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isDeleting, setIsDeleting] = useState(false);
  const damageBtnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(damageBtnOpacity, {
      toValue: damagesState.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true, // 👈 opacity sí soporta native driver
    }).start();
  }, [damagesState.length]);

  /** ------------------ Inicializar damagesState ------------------ */
  useEffect(() => {
    setDamagesState(item?.damages || []);
  }, [item?.damages]);

  /** ------------------ Pulse effect ------------------ */
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      setPulseLocked(true);
      clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => setPulseLocked(false), 3000);
    }
    return () => clearTimeout(pulseTimeoutRef.current);
  }, [isActive]);

  useEffect(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(0);
    if (!pulseLocked) return;

    const loop = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => finished && pulseLocked && loop());
    };
    loop();
    return () => pulseAnim.stopAnimation();
  }, [pulseLocked]);

  /** ------------------ Interpolaciones ------------------ */
  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,0,0,0)", "rgba(255, 60, 60, 0.84)"],
  });
  const shadowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });
  const danosHeight = danosAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });
  const danosOpacity = danosAnim.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0, 1],
  });

  /** ------------------ Toggle daños ------------------ */
  const toggleDanos = () => {
    Animated.timing(danosAnim, {
      toValue: damaged ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDamaged((prev) => !prev);
  };

  /** ------------------ Delete scan ------------------ */
  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => onDelete(item.scan_id_local, item.vin));
  };

  /** ------------------ Delete damage ------------------ */
  const handleDeleteDamage = async (damageToDelete) => {
    setDamagesState((prev) => prev.filter((d) => d.id !== damageToDelete.id));

    try {
      await markToDelete(damageToDelete.id);
      requestSync();
      //await deleteDamagePerVINandID();
    } catch (e) {
      console.warn("Error eliminando daño", e);
    }
  };

  /** ------------------ Render ------------------ */
  return (
    <Animated.View
      style={[
        styles.card,
        isDeleting && {
          height: heightAnim,
          opacity: opacityAnim,
          overflow: "hidden",
        },
        isActive && {
          borderColor,
          shadowColor: "rgba(151, 255, 60, 0.9)",
          shadowOpacity,
          shadowRadius: 2,
          elevation: 1,
        },
      ]}
    >
      {/* {console.log(item.synced)} */}
      {item.synced === 0 && (
        <IconButton
          size={30}
          style={{ position: "absolute", top: -5 }}
          icon="sync-alert"
          iconColor="rgba(189, 63, 63, 0.85)"
        />
      )}

      {renderVin ? (
        renderVin(item.vin)
      ) : (
        <Text style={styles.code}>{item.vin}</Text>
      )}

      <View style={styles.actionBtnsContainer}>
        <IconButton
          size={30}
          icon="camera-plus"
          iconColor="rgba(34, 144, 117, 0.84)"
          onPress={() =>
            router.push({
              pathname: "/(app)/CameraScreen",
              params: {
                vinFromRouter: item.vin,
                localScanId: item.scan_id_local,
              },
            })
          }
        />
        <IconButton
          size={30}
          icon="car-2-plus"
          iconColor="rgba(34, 144, 117, 0.84)"
          onPress={() =>
            router.push({
              pathname: "/(app)/DanoScreen",
              params: {
                vinFromRouter: item.vin,
                localScanId: item.scan_id_local,
              },
            })
          }
        />
        <View style={{ width: 48, alignItems: "center" }}>
          <Animated.View
            style={{
              opacity: damageBtnOpacity,
              transform: [
                {
                  scale: damageBtnOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
            pointerEvents={damagesState.length > 0 ? "auto" : "none"}
          >
            <IconButton
              size={30}
              icon="car-search-outline"
              iconColor="rgba(34, 144, 117, 0.84)"
              onPress={toggleDanos}
            />
          </Animated.View>
        </View>

        {/* {damaged ? "OCULTAR" : "VER DAÑOS"} */}
        {damagesState.length > 0 && (
          <View style={styles.danosContainer}>
            {/* MEDICIÓN INVISIBLE */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                opacity: 0,
                zIndex: -1,
                width: "100%",
              }}
              onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            >
              <ConsultaDanoItem
                item={{
                  damages: damagesState,
                  fotos: localPicts,
                }}
              />
            </View>

            {/* CONTENIDO ANIMADO REAL */}
            <Animated.View
              key={damagesState.length + "-" + item.vin} // 🔹 Fuerza remount al cambiar nro de daños
              style={{
                height: danosHeight,
                //position: "absolute",
                width: 320,
                left: -160,
                top: 40,
                marginBottom: 40,
                opacity: danosOpacity,
                //overflow: "hidden",
              }}
              pointerEvents={damaged ? "auto" : "none"}
            >
              <ConsultaDanoItem
                item={{
                  damages: damagesState,
                  fotos: localPicts,
                }}
                onDeleteDamage={handleDeleteDamage}
              />
            </Animated.View>
          </View>
        )}
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.infoTitle}>BATEA</Text>
            <Text style={styles.infoText}>
              {item.batea === "" ? "----" : item.batea}
            </Text>
          </View>
          <View>
            <Text style={styles.infoTitle}>MOVIMIENTO</Text>
            <Text style={styles.infoText}>{item.movimiento}</Text>
          </View>
        </View>
        <IconButton
          size={30}
          style={{ position: "absolute", left: 280, top: -53 }}
          icon="delete"
          iconColor="rgba(222, 71, 71, 0.83)"
          onPress={handleDelete}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#8fb0aa7f",
    borderColor: "#ededed71",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingBottom: 0,
    margin: 5,
    //boxShadow: "1px 1px 6px 1px rgba(145, 145, 145, 0.79)",
  },
  danosContainer: {},
  button: { marginTop: 12, width: "100%", alignSelf: "center" },
  actionBtnsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    //backgroundColor: "#d6cccc8d",
    borderTopWidth: 1,
    marginTop: 8,
    borderTopColor: "#e1dcdc8a",
  },
  code: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#4d4d4d",
    textAlign: "center",
  },
  infoContainer: {
    position: "absolute",
    right: 10,
    top: 8,
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    gap: "10",
  },
  infoText: {
    fontSize: 12,
    color: "#2f2d2deb",
    textAlign: "center",
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#302f2feb",
    textAlign: "center",
  },
});

export default memo(ScanItem);
