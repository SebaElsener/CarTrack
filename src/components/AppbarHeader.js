import { usePathname, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import InfoBar from "../screens/InfoBar";

let isEstadoScreen;

export default function AppHeader({ syncing, logout }) {
  const router = useRouter();
  const pathname = usePathname();
  isEstadoScreen = pathname.includes("EstadoViajeScreen");

  return (
    <Appbar.Header
      style={[styles.appBarContainer, isEstadoScreen && { height: 60 }]}
    >
      <View style={styles.appBarItemsContainer}>
        <Appbar.Action
          icon="home"
          color="white"
          size={30}
          onPress={() => router.replace("/(app)/HomeScreen")}
        />
        <Appbar.Action
          icon="barcode-scan"
          color="white"
          size={30}
          onPress={() => router.replace("/(app)/ScannerScreen")}
        />

        {syncing && (
          <View style={styles.lottieContainer}>
            <Text style={{ color: "white" }}>SYNC</Text>
            <LottieView
              source={require("../utils/Syncwhite.json")}
              autoPlay
              loop
              style={{ width: 30, height: 30 }}
            />
          </View>
        )}

        <View style={{ flex: 1 }} />
        <Appbar.Action icon="logout" color="white" size={30} onPress={logout} />
      </View>

      {!isEstadoScreen && (
        <View style={styles.appBarDate}>
          <InfoBar />
        </View>
      )}

      {!isEstadoScreen && (
        <Pressable
          style={styles.appBarActionsRow}
          onPress={() => router.push("/(app)/EstadoViajeScreen")}
        >
          <Appbar.Action
            icon="clipboard-text-search-outline"
            color="white"
            size={28}
          />

          <Text style={styles.actionLabel}>
            REVISAR ESTADO DE CARGA / DESCARGA
          </Text>
        </Pressable>
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  appBarItemsContainer: {
    flexDirection: "row",
  },
  appBarContainer: {
    backgroundColor: "rgba(0,0,0,0.25)",
    flexDirection: "column",
    height: 140,
  },
  appBarDate: {
    width: "100%",
    borderTopWidth: 0.3,
    borderTopColor: "#edededc5",
  },
  lottieContainer: {
    justifyContent: "center",
    width: 60,
    height: 55,
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 10,
  },
  appBarInfoAndLocation: {
    width: "100%",
    borderTopWidth: 0.3,
    borderTopColor: "#edededc5",
    flexDirection: "row",
  },
  location: {
    width: "25%",
    borderLeftWidth: 0.3,
    borderLeftColor: "#edededc5",
  },
  appBarWeather: {
    width: "100%",
  },
  appBarActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    //paddingHorizontal: 12,
    //paddingVertical: 6,
    borderTopWidth: 0.3,
    borderTopColor: "#edededc5",
  },

  actionLabel: {
    color: "white",
    fontSize: 13,
    //marginLeft: 6,
    fontWeight: "700",
  },
});
