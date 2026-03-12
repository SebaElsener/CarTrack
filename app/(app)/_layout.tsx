import { Stack } from "expo-router";
import AppHeader from "../../src/components/AppbarHeader";

export default function AppLayout() {
  return (
    <>
      <AppHeader />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "transparent",
          },
          headerShown: false,
        }}
      />
    </>
  );
}
