import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import ConsultaDanoItem from "./ConsultaDanoItem";

function ScanItem({ item, isActive, onDelete }) {
  const router = useRouter();

  /** ------------------ Pulse ------------------ */
  const pulseAnim = useRef(new Animated.Value(0)).current;
  //const loopRef = (useRef < Animated.CompositeAnimation) | (null > null);
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
      onDelete(item.id);
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

      <Text style={styles.code}>{item.vin}</Text>

      {item.damages != null && (
        <View style={styles.danosContainer}>
          <Button
            buttonColor="rgba(133, 207, 189, 0.98)"
            mode="contained"
            onPress={toggleDanos}
            style={styles.button}
          >
            {damaged ? "OCULTAR" : "VER DAÑOS"}
          </Button>

          {/* Hidden measure */}
          <View
            style={{ position: "absolute", opacity: 0, zIndex: -1 }}
            onLayout={(e) => {
              if (contentHeight === 0) {
                setContentHeight(e.nativeEvent.layout.height);
              }
            }}
          >
            <ConsultaDanoItem
              item={{
                ...item,
                // date: item.date,
                // vin: item.vin,
                // fotos: item.fotos,
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
                ...item,
                // date: item.date,
                // vin: item.vin,
                // fotos: item.fotos,
              }}
            />
          </Animated.View>
        </View>
      )}

      <View style={styles.actionBtnsContainer}>
        <IconButton
          size={40}
          icon="camera-plus"
          iconColor="rgba(133, 207, 189, 0.98)"
          onPress={() =>
            router.push({
              pathname: "/(app)/CameraScreen",
              params: { vinFromRouter: item.vin },
            })
          }
        />
        <IconButton
          size={40}
          icon="car-2-plus"
          iconColor="rgba(133, 207, 189, 0.98)"
          onPress={() =>
            router.push({
              pathname: "/(app)/DanoScreen",
              params: { vinFromRouter: item.vin },
            })
          }
        />
        <IconButton
          size={40}
          icon="delete"
          iconColor="rgba(244, 157, 157, 0.91)"
          onPress={handleDelete}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#86b2aa20",
    borderColor: "#ededed71",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    margin: 10,
    boxShadow: "1px 1px 6px 1px rgba(145, 145, 145, 0.79)",
  },
  code: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 23,
    color: "#4d4d4de2",
  },
  danosContainer: {
    //margin: 5,
  },
  button: {
    marginBottom: 12,
    marginTop: 12,
  },
  actionBtnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default memo(ScanItem);
