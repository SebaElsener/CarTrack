import { View } from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export default function InfoBar() {
  const { operator } = useAuth();

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
        //paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <View>
        <Text style={{ color: "#eeeeeeff", fontWeight: 700, fontSize: 15 }}>
          EQUIPO: {operator?.transport_nbr} / {operator?.name}
        </Text>
      </View>
    </View>
  );
}
