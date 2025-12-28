import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { useScans } from "../context/ScanContext";

export default function InfoBar() {
  const [hora, setHora] = useState(new Date());
  const { scansCount } = useScans();

  useEffect(() => {
    const interval = setInterval(() => {
      setHora(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const weekday = hora
    .toLocaleDateString("es-AR", { weekday: "short" })
    .replace(".", "")
    .replace(/^./, (c) => c.toUpperCase());

  const month = hora
    .toLocaleDateString("es-AR", { month: "short" })
    .replace(".", "")
    .replace(/^./, (c) => c.toUpperCase());

  const day = hora.toLocaleDateString("es-AR", { day: "2-digit" });

  const time = hora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const fechaHora = `${weekday} ${day} ${month} · ${time}`;

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
      }}
    >
      <View>
        <Text style={{ color: "#eeeeeeff", fontWeight: 700, fontSize: 13.5 }}>
          {fechaHora}
        </Text>
      </View>
      <View>
        <Text
          style={{
            color: "#eeeeeeff",
            fontWeight: 700,
            fontSize: 13.5,
          }}
        >
          VIN escaneados: {scansCount}
        </Text>
      </View>
    </View>
  );
}
