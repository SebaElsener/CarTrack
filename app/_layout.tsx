
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { MD3LightTheme, Provider as PaperProvider, Snackbar } from 'react-native-paper';
import { AuthProvider, useAuth } from "../src/context/AuthContext";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
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
      <Stack screenOptions={{ headerShown: false }} />
      <Snackbar
        visible={visible}
        onDismiss={() => { setVisible(false); setError(""); }}
        duration={3000}
      >
        {error}
      </Snackbar>
    </>
  );
}