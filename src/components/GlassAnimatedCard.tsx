import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  href?:
    | "/(app)/ScannerScreen"
    | "/(app)/HistoryScreen"
    | "/(app)/ConsultaDanoScreen";
  onPress?: () => void;
  textColor?: string;
}

export default function GlassAnimatedCard({
  title,
  description,
  icon,
  backgroundColor = "rgba(255,255,255,0.25)",
  href,
  onPress,
  textColor = "#161616c1",
}: Props) {
  const router = useRouter();
  const [locked, setLocked] = useState(false);

  // Animaciones
  //const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;

  // Giro 3D
  // const rotateY = rotateAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ["0deg", "180deg"],
  // });

  // 💎 Intensidad dinámica según color de la card
  const getShineOpacity = (bgColor: string) => {
    const match = bgColor.match(/rgba?\((\d+), ?(\d+), ?(\d+)/);
    if (!match) return 0.3;
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return 0.2 + (1 - lum) * 0.15; // rango 0.2-0.35
  };
  const shineMaxOpacity = getShineOpacity(backgroundColor);

  const handlePress = () => {
    if (locked) return;
    setLocked(true);

    Animated.parallel([
      // 🔁 Giro 3D
      // Animated.timing(rotateAnim, {
      //   toValue: 1,
      //   duration: 500,
      //   useNativeDriver: true,
      // }),

      // ✨ Brillo glass
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),

      // ⬆️ Lift + scale (sombra dinámica)
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.04,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(liftAnim, {
          toValue: -8,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),

      // 🌟 Brillo diagonal tipo iOS 17
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.delay(40),
        Animated.timing(shineAnim, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      //rotateAnim.setValue(0);
      setLocked(false);

      if (href) router.push(href);
      else onPress?.();
    });
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [
            { perspective: 800 },
            // { rotateY },
            { scale: scaleAnim },
            { translateY: liftAnim },
          ],
        },
      ]}
    >
      <Pressable onPress={handlePress}>
        <BlurView
          intensity={45}
          tint="light"
          style={[styles.card, { backgroundColor }]}
        >
          {/* ICON */}
          {icon && <View style={styles.icon}>{icon}</View>}

          {/* TEXT */}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {description && (
            <Text style={[styles.description, { color: textColor }]}>
              {description}
            </Text>
          )}

          {/* ✨ Glow overlay */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: "white",
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.35],
                }),
                borderRadius: 22,
              },
            ]}
          />

          {/* 🌟 Brillo diagonal */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.diagonalShine,
              {
                opacity: shineAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0, shineMaxOpacity, 0],
                }),
                transform: [
                  { rotate: "-25deg" },
                  {
                    translateX: shineAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-220, 220],
                    }),
                  },
                ],
              },
            ]}
          />
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 22,
    // Sombra glass
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 12 },
    // shadowOpacity: 0.18,
    // shadowRadius: 20,
    //elevation: 8,
  },
  card: {
    height: 195,
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    fontSize: 13,
    opacity: 0.8,
    marginTop: 4,
    textAlign: "center",
  },
  diagonalShine: {
    position: "absolute",
    top: -60,
    left: -120,
    width: 120,
    height: 300,
    backgroundColor: "white",
    borderRadius: 60,
  },
});
