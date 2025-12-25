// app/_layout.tsx
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
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
  const { error, setError } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error) setVisible(true);
  }, [error]);

  return (
    <>
      <ImageBackground
        source={require("./background-cars.jpg")}
        style={styles.background}
        imageStyle={{ opacity: 0.2 }}
      >
        {/* Overlay glass */}
        <View style={styles.overlay} />

        {/* Las screens viven acá */}
        <Slot />
      </ImageBackground>

      <Snackbar
        visible={visible}
        onDismiss={() => {
          setVisible(false);
          setError("");
        }}
        duration={3000}
      >
        {error}
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
