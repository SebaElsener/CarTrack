import { useState } from "react";
import { Text, View } from "react-native";
import { Icon, Menu, TouchableRipple } from "react-native-paper";

export default function MovimientoMenu() {
  const [visible, setVisible] = useState(false);
  const [movimiento, setMovimiento] = useState(null);

  const closeMenu = () => setVisible(false);

  const label =
    movimiento === "INGRESO"
      ? "Ingreso"
      : movimiento === "DESPACHO"
        ? "Despacho"
        : "Movimiento";

  return (
    <View style={{}}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableRipple
            borderless
            style={{ backgroundColor: "green" }}
            onPress={() => setVisible(true)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>
                {label}
              </Text>
              <Icon source="chevron-down" size={18} color="white" />
            </View>
          </TouchableRipple>
        }
      >
        <Menu.Item
          title="Ingreso"
          onPress={() => {
            setMovimiento("INGRESO"); // ✅ se guarda
            closeMenu();
          }}
        />

        <Menu.Item
          title="Despacho"
          onPress={() => {
            setMovimiento("DESPACHO"); // ✅ se guarda
            closeMenu();
          }}
        />
      </Menu>
    </View>
  );
}
