
// import { Button } from "react-native-paper";
// import { useAuth } from "../context/AuthContext";

// export default function SettingsScreen() {
//   const { logout } = useAuth();

//   return (
//     <Button
//       icon="logout"
//       mode="contained"
//       onPress={logout}
//     >
//       Cerrar sesión
//     </Button>
//   );
// }

import { Button, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
      <Text style={{ fontSize: 20 }}>Mi Aplicación</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}