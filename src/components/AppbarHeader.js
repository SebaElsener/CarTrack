import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import InfoBar from "../screens/InfoBar";
import TransportBar from "../screens/TransportBar";
import WeatherCondition from "../screens/WeatherCondition";
import LocationStatusbar from "./LocationStatusBar";

export default function AppHeader({ syncing, logout }) {
  const router = useRouter();

  return (
    <Appbar.Header style={styles.appBarContainer}>
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
        <Appbar.Action
          icon="clipboard-list-outline"
          color="white"
          size={30}
          onPress={() => router.replace("/(app)/HistoryScreen")}
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

      <View style={styles.appBarDate}>
        <InfoBar />
      </View>

      <View style={styles.appBarInfoAndLocation}>
        <View style={{ width: "75%" }}>
          <TransportBar />
        </View>
        <View style={styles.location}>
          <LocationStatusbar />
        </View>
      </View>

      <View style={styles.appBarWeather}>
        <WeatherCondition />
      </View>
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
    height: 205,
    //zIndex: 999999,
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
});
