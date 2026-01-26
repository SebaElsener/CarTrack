import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
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
      {item.synced === 0 && (
        <IconButton
          size={30}
          icon="sync-alert"
          iconColor="rgba(244, 157, 157, 0.91)"
        />
      )}

      {renderVin ? (
        renderVin(item.vin)
      ) : (
        <Text style={styles.code}>{item.vin}</Text>
      )}

      {damagesState.length > 0 && (
        <View style={styles.danosContainer}>
          <Button
            buttonColor="rgba(108, 178, 160, 0.78)"
            mode="contained"
            labelStyle={{ fontSize: 13 }}
            onPress={toggleDanos}
            style={styles.button}
          >
            {damaged ? "OCULTAR" : "VER DAÑOS"}
          </Button>

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
              opacity: danosOpacity,
              overflow: "hidden",
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

      <View style={styles.actionBtnsContainer}>
        <IconButton
          size={35}
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
          size={35}
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
        <IconButton
          size={35}
          icon="delete"
          iconColor="rgba(241, 125, 125, 0.81)"
          onPress={handleDelete}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#86b2aa7f",
    borderColor: "#ededed71",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingBottom: 0,
    margin: 5,
    //boxShadow: "1px 1px 6px 1px rgba(145, 145, 145, 0.79)",
  },
  danosContainer: {},
  button: { marginTop: 12, width: "90%", alignSelf: "center" },
  actionBtnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  code: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#4d4d4d",
    textAlign: "center",
  },
});

export default memo(ScanItem);
