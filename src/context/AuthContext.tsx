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
type Operator = {
  id: string;
  name: string;
  transport_nbr: string;
};

const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  loading: boolean;
  operator: Operator | null;
  setOperator: (op: Operator | null) => Promise<void>;
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
  operator: null,
  setOperator: async () => {},
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
  const [operator, setOperatorState] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
    type: "success",
  });

  const setOperator = async (op: Operator | null) => {
    setOperatorState(op);

    if (op) {
      await SecureStore.setItemAsync("operator", JSON.stringify(op));
    } else {
      await SecureStore.deleteItemAsync("operator");

      // opcional: limpiar metadata
      await supabase.auth.updateUser({
        data: {
          transport_nbr: null,
        },
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();

      const savedOperator = await SecureStore.getItemAsync("operator");

      setOperatorState(savedOperator ? JSON.parse(savedOperator) : null);
      setSession(data.session);
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
      await supabase.auth.updateUser({
        data: {
          transport_nbr: null,
        },
      });
      await supabase.auth.signOut();
      setSession(null);
      setLoading(false);
      await SecureStore.deleteItemAsync("operator");
      await SecureStore.deleteItemAsync("supabase.auth.token");
      setOperatorState(null);

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
        operator,
        setOperator,
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
