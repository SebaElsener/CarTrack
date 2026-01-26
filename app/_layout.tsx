import { Slot } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";
import { ToastProvider } from "../src/components/ToastProvider";
import { AuthProvider } from "../src/context/AuthContext";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: "transparent",
    surface: "transparent",
    primary: "#6200ee",
    secondary: "#03dac6",
  },
  roundness: 1,
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <ToastProvider>
        <AuthProvider>
          <RootContainer />
        </AuthProvider>
      </ToastProvider>
    </PaperProvider>
  );
}

function RootContainer() {
  return (
    <ImageBackground
      source={require("./background-cars.jpg")}
      style={styles.background}
      imageStyle={{ opacity: 0.35 }}
    >
      <View style={styles.overlay} />
      <Slot />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
