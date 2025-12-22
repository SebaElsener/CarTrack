import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { deleteScan } from "../database/Database";
import ConsultaDanoItem from "./ConsultaDanoItem";

const router = useRouter();

function ScanItem({ item, isActive }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);
  const [damaged, setDamaged] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const danosAnim = useRef(new Animated.Value(0)).current;

  const toggleDanos = () => {
    Animated.timing(danosAnim, {
      toValue: damaged ? 0 : 1,
      duration: 300,
      useNativeDriver: false, // height no soporta native
    }).start();

    setDamaged((prev) => !prev);
  };

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

  return (
    <Animated.View
      style={[
        styles.card,
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
        <View>
          <IconButton
            style={styles.syncIconButton}
            size={30}
            icon="sync-alert"
            iconColor="rgba(244, 157, 157, 0.91)"
          ></IconButton>
        </View>
      )}
      <Text style={styles.code}>{item.code}</Text>
      {item.area != null ? (
        <View style={styles.danosContainer}>
          <View style={styles.danosBtns}>
            <Button
              buttonColor="rgba(133, 207, 189, 0.98)"
              mode="contained"
              onPress={toggleDanos}
              style={styles.button}
            >
              {damaged ? "OCULTAR" : "VER DAÑOS"}
            </Button>
          </View>
          <View
            style={{ position: "absolute", opacity: 0, zIndex: -1 }}
            onLayout={(e) => {
              if (contentHeight === 0) {
                setContentHeight(e.nativeEvent.layout.height);
              }
            }}
          >
            <ConsultaDanoItem item={item} />
          </View>
          <Animated.View
            style={{
              height: danosHeight,
              opacity: danosOpacity,
              overflow: "hidden",
            }}
          >
            <ConsultaDanoItem item={item} />
          </Animated.View>
        </View>
      ) : (
        <Text></Text>
      )}

      <View style={styles.buttonsBottomContainer}>
        <View style={styles.actionBtnsContainer}>
          <View style={styles.takePhotoContainer}>
            <IconButton
              style={styles.iconButton}
              size={40}
              icon="camera-plus"
              iconColor="rgba(133, 207, 189, 0.98)"
              onPress={() =>
                router.push({
                  pathname: "/(app)/CameraScreen",
                  params: { vinFromRouter: item.code },
                })
              }
            ></IconButton>
          </View>
          <View style={styles.addDamageContainer}>
            <IconButton
              style={styles.iconButton}
              size={40}
              icon="car-2-plus"
              iconColor="rgba(133, 207, 189, 0.98)"
              onPress={() =>
                router.push({
                  pathname: "/(app)/DanoScreen",
                  params: { vinFromRouter: item.code },
                })
              }
            ></IconButton>
          </View>
          <View style={styles.deleteContainer}>
            <IconButton
              style={styles.iconButton}
              size={40}
              icon="delete"
              iconColor="rgba(244, 157, 157, 0.91)"
              onPress={() => deleteScan(item.id)}
            ></IconButton>
          </View>
        </View>
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
    margin: 15,
  },
  buttonsBottomContainer: {
    margin: 15,
    marginTop: 0,
    marginBottom: 0,
    display: "flex",
    //flexDirection: "row",
    justifyContent: "space-between",
    //width: "100%",
  },
  syncedContainer: {
    justifyContent: "center",
  },
  danosBtns: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  button: {
    marginBottom: 12,
    flexGrow: 1,
  },
  actionBtnsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  syncAndTitleContainer: {
    display: "flex",
    flexDirection: "row",
  },
});

export default memo(ScanItem);
