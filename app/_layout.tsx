// app/_layout.tsx
import { Slot } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";
import {
  MD3LightTheme,
  Provider as PaperProvider,
  Snackbar,
} from "react-native-paper";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

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
      <AuthProvider>
        <RootContainer />
      </AuthProvider>
    </PaperProvider>
  );
}

function RootContainer() {
  const { snackbar, hideSnackbar } = useAuth();

  return (
    <>
      <ImageBackground
        source={require("./background-cars.jpg")}
        style={styles.background}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.overlay} />
        <Slot />
      </ImageBackground>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
        wrapperStyle={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
        style={{
          marginTop: 40, // 👈 separa de notch / status bar
          marginHorizontal: 16,
          borderRadius: 8,
          backgroundColor: snackbar.type === "success" ? "#2ecc71" : "#e74c3c",
        }}
      >
        {snackbar.message}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
