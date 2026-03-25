import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";

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
  loading?: boolean;
  disabled?: boolean;
}

export default function GlassAnimatedCard({
  title,
  description,
  icon,
  backgroundColor = "rgba(118, 100, 100, 0.18)",
  href,
  onPress,
  loading,
  disabled,
  textColor = "#161616c1",
}: Props) {
  const router = useRouter();
  const [locked, setLocked] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const loaderScale = useRef(new Animated.Value(0.6)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  const opacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: loading ? 0.6 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: loading ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  useEffect(() => {
    if (loading) {
      Animated.parallel([
        // icono desaparece
        Animated.timing(iconOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),

        // loader aparece
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 200,
          //delay: 100,
          useNativeDriver: true,
        }),
        Animated.spring(loaderScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        // icono vuelve
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),

        // loader desaparece
        Animated.timing(loaderOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(loaderScale, {
          toValue: 0.6,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handlePress = () => {
    if (locked || loading || disabled) return;
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
          opacity: disabled ? 0.4 : opacity,
        },
      ]}
    >
      <Pressable onPress={handlePress} disabled={loading || disabled}>
        {/* 🟢 GLASS REAL */}
        <BlurView intensity={45} tint="light" style={styles.glass}>
          <View style={[styles.glassFill, { backgroundColor }]}>
            {icon && (
              <View style={styles.icon}>
                {/* ICONO */}
                <Animated.View
                  style={{
                    position: "absolute",
                    opacity: iconOpacity,
                    transform: [{ scale: iconScale }],
                  }}
                >
                  {icon}
                </Animated.View>

                {/* LOADER */}
                <Animated.View
                  style={{
                    position: "absolute",
                    opacity: loaderOpacity,
                    transform: [{ scale: loaderScale }],
                  }}
                >
                  <ActivityIndicator size="large" color="#fa0505fe" />
                </Animated.View>
              </View>
            )}

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

  icon: {
    marginBottom: 8,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)", // leve oscurecido
  },

  loadingText: {
    marginTop: 10,
    color: "white",
    fontWeight: "600",
  },
});
