// app/(app)/_layout.tsx
import { Stack, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import LocationStatusbar from "../../src/components/LocationStatusBar";
import { useAuth } from "../../src/context/AuthContext";
import { ScansProvider } from "../../src/context/ScanContext";
import InfoBar from "../../src/screens/InfoBar";
import TransportBar from "../../src/screens/TransportBar";
import WeatherCondition from "../../src/screens/WeatherCondition";
import "../../src/services/gps/locationTask";
import SyncManager from "./SyncManager";

export default function AppLayout() {
  const { logout, loading, session } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/(app)/HomeScreen");
    } else if (!loading && !session) {
      router.replace("/(auth)/login");
    }
  }, [session, loading, router]);

  return (
    <>
      <SyncManager onSyncChange={setSyncing} />
      <ScansProvider>
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: "transparent", // 🔥 CLAVE
            },
            header: () => (
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
                      {syncing && <Text style={{ color: "white" }}>SYNC</Text>}
                      <LottieView
                        source={require("../../src/utils/Syncwhite.json")}
                        autoPlay
                        loop
                        style={{ width: 30, height: 30 }}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }} />
                  <Appbar.Action
                    icon="logout"
                    color="white"
                    size={30}
                    onPress={logout}
                  />
                </View>
                <View style={styles.appBarDate}>
                  <InfoBar />
                </View>
                <View style={styles.appBarInfoAndLocation}>
                  <View style={{ width: "70%" }}>
                    <TransportBar />
                  </View>
                  <View
                    style={{
                      width: "30%",
                      borderLeftWidth: 0.3,
                      borderLeftColor: "#edededc5",
                    }}
                  >
                    <LocationStatusbar />
                  </View>
                </View>
                <View style={styles.appBarWeather}>
                  <WeatherCondition />
                </View>
              </Appbar.Header>
            ),
          }}
        />
      </ScansProvider>
    </>
  );
}

const styles = StyleSheet.create({
  appBarItemsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  appBarContainer: {
    backgroundColor: "rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    //paddingTop: 30,
    alignItems: "flex-start",
    justifyContent: "center",
    height: 205,
    //width: "100%",
  },
  appBarDate: {
    //justifyContent: "space-between",
    //marginLeft: 6,
    width: "100%",
    borderTopWidth: 0.3,
    borderTopColor: "#edededc5",
  },
  lottieContainer: {
    justifyContent: "center",
    width: 60,
    height: 55,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    marginLeft: 10,
  },
  appBarWeather: {
    //paddingBottom: 20,
    width: "100%",
    //paddingHorizontal: 10,
    justifyContent: "center",
  },
  appBarInfoAndLocation: {
    width: "100%",
    borderTopWidth: 0.3,
    borderTopColor: "#edededc5",
    display: "flex",
    //backgroundColor: "#e8e3e377",
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
