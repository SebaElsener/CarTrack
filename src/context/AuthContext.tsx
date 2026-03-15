import type { Session, User } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useToast } from "../components/ToastProvider";
import { supabase } from "../services/supabase";

type SnackbarType = "success" | "error";

type SnackbarState = {
  visible: boolean;
  message: string;
  type: SnackbarType;
};

const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  loading: boolean;
  transportNbr: string | null;
  setTransportNbr: (v: string | null) => Promise<void>;
  operatorName: string | null;
  setOperatorName: (v: string | null) => void;
  logout: () => Promise<void>;
  setLoading: (value: boolean) => void;

  // 🔔 Snackbar API
  snackbar: SnackbarState;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  hideSnackbar: () => void;
}>({
  session: null,
  user: null,
  loading: true,
  transportNbr: null,
  setTransportNbr: async () => {},
  operatorName: null,
  setOperatorName: () => {},
  logout: async () => {},
  setLoading: () => {},

  snackbar: { visible: false, message: "", type: "success" },
  showSuccess: () => {},
  showError: () => {},
  hideSnackbar: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [transportNbr, setTransportNbr] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
    type: "success",
  });

  const setTransportNbrPersist = async (value: string | null) => {
    setTransportNbr(value);

    if (value) {
      await SecureStore.setItemAsync("transportNbr", value);
    } else {
      await SecureStore.deleteItemAsync("transportNbr");
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();

      const savedTransport = await SecureStore.getItemAsync("transportNbr");

      setSession(data.session);
      setTransportNbr(savedTransport);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setLoading(false);
      await SecureStore.deleteItemAsync("transportNbr");
      setTransportNbr(null);
      showToast("Sesión cerrada correctamente", "info");
    } catch (err: any) {
      showToast(err.message || "Error al cerrar sesión", "error");
    }
  };

  // 🔔 Helpers de Snackbar
  const showSuccess = (message: string) => {
    setSnackbar({
      visible: true,
      message,
      type: "success",
    });
  };

  const showError = (message: string) => {
    setSnackbar({
      visible: true,
      message,
      type: "error",
    });
  };

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, visible: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        logout,
        setLoading,
        transportNbr,
        setTransportNbr: setTransportNbrPersist,
        operatorName,
        setOperatorName,
        snackbar,
        showSuccess,
        showError,
        hideSnackbar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
