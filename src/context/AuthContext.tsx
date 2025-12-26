import type { Session } from "@supabase/supabase-js";
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
  loading: boolean;
  logout: () => Promise<void>;
  setLoading: (value: boolean) => void;

  // 🔔 Snackbar API
  snackbar: SnackbarState;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  hideSnackbar: () => void;
}>({
  session: null,
  loading: true,
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
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setLoading(false);
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
        loading,
        logout,
        setLoading,
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
