
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    />
  );
}
