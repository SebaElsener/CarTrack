import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function InfoBar() {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setHora(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const weekday = hora
    .toLocaleDateString("es-AR", { weekday: "short" })
    .replace(/^./, (c) => c.toUpperCase());

  const fechaHora = `${weekday} ${hora.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  })} ${hora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}`;

  return (
    <View>
      <Text style={{ color: "#eeeeeeff", fontWeight: 700, fontSize: 13.5 }}>
        {fechaHora}
      </Text>
    </View>
  );
}
