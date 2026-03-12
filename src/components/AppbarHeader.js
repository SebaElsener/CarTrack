import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";

export default function AppHeader() {
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

        <View style={{ flex: 1 }} />
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
    //height: 205,
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
