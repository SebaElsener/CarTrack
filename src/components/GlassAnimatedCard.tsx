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
  backgroundColor = "rgba(118, 100, 100, 0.18)",
  href,
  onPress,
  textColor = "#161616c1",
}: Props) {
  const router = useRouter();
  const [locked, setLocked] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;

  const handlePress = () => {
    if (locked) return;
    setLocked(true);

    Animated.parallel([
      // 🔽 Scale hacia adentro
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),

      // ⬇️ Baja la card
      Animated.sequence([
        Animated.timing(liftAnim, {
          toValue: 6,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),

      // ✨ Glow más sutil
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]),

      // 🌟 Shine inverso
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setLocked(false);
      if (href) router.push(href);
      else onPress?.();
    });
  };

  return (
    // 🟣 CONTENEDOR DE SOMBRA (NO blur acá)
    <Animated.View
      style={[
        styles.shadowWrapper,
        {
          transform: [{ scale: scaleAnim }, { translateY: liftAnim }],
        },
      ]}
    >
      <Pressable onPress={handlePress}>
        {/* 🟢 GLASS REAL */}
        <BlurView intensity={45} tint="light" style={styles.glass}>
          <View style={[styles.glassFill, { backgroundColor }]}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            {description && (
              <Text style={[styles.description, { color: textColor }]}>
                {description}
              </Text>
            )}

            {/* ✨ Glow */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: "white",
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.28],
                  }),
                  //borderRadius: 22,
                },
              ]}
            />

            {/* 🌟 Shine diagonal */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.diagonalShine,
                {
                  opacity: shineAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [0, 0.28, 0],
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
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // 🟣 SOLO sombra acá
  shadowWrapper: {
    width: "100%",
    //borderRadius: 22,

    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    //boxShadow: "0px 0px 10px 1px #928f8fb7",

    // Android
    //elevation: 16,
  },

  // 🟢 Blur sin sombra
  glass: {
    //borderRadius: 22,
    overflow: "hidden",
  },

  glassFill: {
    height: 195,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    //borderRadius: 22,
    overflow: "hidden",
  },

  icon: { marginBottom: 8 },

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
