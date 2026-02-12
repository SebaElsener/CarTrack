import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Text } from "react-native-paper";
import AnimatedBadge from "../components/AnimatedBadge";
import LocationList from "../components/LocationList";
import { useScans } from "../context/ScanContext";

export default function InfoBar() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  // const [hora, setHora] = useState(new Date());
  const { totalScans } = useScans();

  const releaseAndNavigate = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start(() => {
      router.push("/(app)/HistoryScreen");
    });
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setHora(new Date());
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  // const weekday = hora
  //   .toLocaleDateString("es-AR", { weekday: "short" })
  //   .replace(".", "")
  //   .replace(/^./, (c) => c.toUpperCase());

  // const month = hora
  //   .toLocaleDateString("es-AR", { month: "short" })
  //   .replace(".", "")
  //   .replace(/^./, (c) => c.toUpperCase());

  // const day = hora.toLocaleDateString("es-AR", { day: "2-digit" });

  // const time = hora.toLocaleTimeString("es-AR", {
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   second: "2-digit",
  // });

  // const fechaHora = `${weekday} ${day} ${month} · ${time}`;

  const fecha = new Date();

  const weekday = fecha
    .toLocaleDateString("es-AR", { weekday: "short" })
    .replace(".", "")
    .replace(/^./, (c) => c.toUpperCase());

  const month = fecha
    .toLocaleDateString("es-AR", { month: "short" })
    .replace(".", "")
    .replace(/^./, (c) => c.toUpperCase());

  const day = fecha.toLocaleDateString("es-AR", { day: "2-digit" });

  const formattedDate = `${weekday} ${day} ${month}`;

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
        <Text style={{ color: "#eeeeeeff", fontWeight: 700, fontSize: 13.5 }}>
          {formattedDate}
        </Text>
      </View>
      <Pressable
        onPressIn={() =>
          Animated.timing(scale, {
            toValue: 0.94,
            duration: 40,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={releaseAndNavigate}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                color: "#eeeeeeff",
                fontWeight: 700,
                fontSize: 13.5,
              }}
            >
              VIN total:
            </Text>

            <AnimatedBadge value={totalScans} />
          </View>
        </Animated.View>
      </Pressable>
      <View>
        <LocationList />
      </View>
    </View>
  );
}
