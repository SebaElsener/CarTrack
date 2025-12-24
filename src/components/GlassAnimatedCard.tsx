import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Href, useRouter } from "expo-router";
import { ReactNode, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: Href;
  onPress?: () => void;
  backgroundColor?: string;
}

export default function GlassAnimatedCard({
  title,
  description,
  icon,
  href,
  onPress,
  backgroundColor = "rgba(255,255,255,0.25)",
}: Props) {
  const router = useRouter();
  const [locked, setLocked] = useState(false);

  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    if (locked) return;
    setLocked(true);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // ✨ Glow JS (separado)
    Animated.timing(glow, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();

    // 🚀 Animaciones nativas
    Animated.parallel([
      Animated.timing(rotate, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 450,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.75,
        duration: 450,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotate.setValue(0);
      opacity.setValue(1);
      scale.setValue(1);
      glow.setValue(0);
      setLocked(false);

      if (href) router.push(href);
      else onPress?.();
    });
  };

  ////////
  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.6],
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ rotate: spin }, { scale }],
            shadowOpacity,
          },
        ]}
      >
        <BlurView
          intensity={45}
          tint="light"
          style={[styles.blur, { backgroundColor }]}
        >
          <View style={styles.iconContainer}>{icon}</View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 1, // 🔑 cuadrada para grid
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowRadius: 16,
    elevation: 10,
  },
  blur: {
    flex: 1, // ocupa todo el wrapper
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(54, 54, 54, 0.82)",
    textAlign: "center",
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(42,42,42,0.7)",
    textAlign: "center",
  },
  text: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "600",
    color: "rgba(42,42,42,0.85)",
  },
});
