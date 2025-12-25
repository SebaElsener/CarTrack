import { Stack } from "expo-router";
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
        <RootStack />
      </AuthProvider>
    </PaperProvider>
  );
}

function RootStack() {
  const { error, setError } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error) setVisible(true);
  }, [error]);

  return (
    <>
      {/* Fondo general */}
      <ImageBackground
        source={require("./background-cars.jpg")} // tu imagen de fondo
        style={styles.background}
        imageStyle={{ opacity: 0.35 }}
      >
        <View style={styles.overlay}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
        </View>
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
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)", // overlay glass sutil
  },
});
