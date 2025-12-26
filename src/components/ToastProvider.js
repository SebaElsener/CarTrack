// app/components/ToastProvider.js
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Portal } from "react-native-paper";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const showToast = (message, type = "success", duration = 3000) => {
    setQueue((q) => [...q, { message, type, duration }]);
  };

  // Procesar cola
  useEffect(() => {
    if (!current && queue.length > 0) {
      const next = queue[0];
      setCurrent(next);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  // Animar + auto-dismiss cada vez que cambia current
  useEffect(() => {
    if (current) {
      // Haptic feedback
      if (current.type === "success")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (current.type === "error")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      else if (current.type === "info")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Animación entrada
      translateY.setValue(-100);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => setCurrent(null));
      }, current.duration);

      return () => clearTimeout(timerRef.current);
    }
  }, [current]);

  const getIcon = (type) => {
    if (type === "success") return "check-circle";
    if (type === "error") return "error";
    if (type === "info") return "info";
    return "notifications";
  };

  const getColor = (type) => {
    if (type === "success") return "#2ecc71";
    if (type === "error") return "#e74c3c";
    if (type === "info") return "#3498db";
    return "#333";
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Portal>
        {current && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toastWrapper,
              { transform: [{ translateY }], opacity },
            ]}
          >
            <View
              style={[
                styles.toast,
                { backgroundColor: getColor(current.type) },
              ]}
            >
              <MaterialIcons
                name={getIcon(current.type)}
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.toastText}>{current.message}</Text>
            </View>
          </Animated.View>
        )}
      </Portal>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 100,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: "80%",
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
