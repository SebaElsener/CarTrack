import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import ConsultaDanoItem from "./ConsultaDanoItem";

function ScanItem({ item, isActive, onDelete, renderVin }) {
  const router = useRouter();
  const [localPicts, setLocalPicts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadPicts = async () => {
      try {
        const pictures = await getPictsLocalUri();
        if (mounted) setLocalPicts(pictures);
      } catch (e) {
        console.log("Error cargando fotos", e);
      }
    };

    if (localPicts.length === 0 && item?.fotos?.length > 0) {
      loadPicts();
    }

    return () => {
      mounted = false;
    };
  }, [item]);

  /** ------------------ Pulse ------------------ */
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  /** ------------------ Delete animation ------------------ */
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const measuredHeight = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /** ------------------ Daños ------------------ */
  const [damaged, setDamaged] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const danosAnim = useRef(new Animated.Value(0)).current;

  const toggleDanos = () => {
    Animated.timing(danosAnim, {
      toValue: damaged ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDamaged((prev) => !prev);
  };

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

  /** ------------------ Measure height ONCE ------------------ */
  const onLayout = (e) => {
    if (measuredHeight.current != null) return;
    const h = e.nativeEvent.layout.height;
    measuredHeight.current = h;
    heightAnim.setValue(h);
  };

  /** ------------------ Delete handler ------------------ */
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
    ]).start(() => {
      onDelete(item.vin);
    });
  };

  /** ------------------ Pulse effect ------------------ */
  useEffect(() => {
    if (isActive) {
      loopRef.current = Animated.loop(
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
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      pulseAnim.setValue(0);
    }

    return () => loopRef.current?.stop();
  }, [isActive]);

  /////// Traer fotos localmente
  const getPictsLocalUri = async () => {
    const path = item?.fotos?.[0];
    if (!path) return [];

    const archivos = await FileSystem.readDirectoryAsync(path);
    const lista = archivos
      .filter((a) => a.endsWith(".jpg"))
      .map((a) => path + a);
    return lista;
  };

  /** ------------------ Render ------------------ */
  return (
    <Animated.View
      onLayout={onLayout}
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

      {/* VIN con highlight si renderVin está presente */}
      {renderVin ? (
        renderVin(item.vin)
      ) : (
        <Text style={styles.code}>{item.vin}</Text>
      )}

      {item.damages[0].area !== null && (
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

          {/* Hidden measure */}
          <View
            style={{ position: "absolute", opacity: 0, zIndex: -1 }}
            onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
          >
            <ConsultaDanoItem
              item={{
                damages: item.damages,
                fotos: localPicts,
              }}
            />
          </View>

          <Animated.View
            style={{
              height: danosHeight,
              opacity: danosOpacity,
              overflow: "hidden",
            }}
          >
            <ConsultaDanoItem
              item={{
                damages: item.damages,
                fotos: localPicts,
              }}
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
              params: { vinFromRouter: item.vin },
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
              params: { vinFromRouter: item.vin },
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
    borderRadius: 8,
    padding: 15,
    margin: 10,
    boxShadow: "1px 1px 6px 1px rgba(145, 145, 145, 0.79)",
  },
  danosContainer: {},
  button: {
    //marginBottom: 12,
    marginTop: 12,
    width: "90%",
    alignSelf: "center",
  },
  actionBtnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default memo(ScanItem);
