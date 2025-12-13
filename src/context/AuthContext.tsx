import type { Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  setError: (msg: string) => void;
  error: string
}>({
  session: null,
  loading: true,
  logout: async () => {},
  setError: () => {},
  error: ""
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message || "Error al cerrar sesión");
    }  };

  return (
    <AuthContext.Provider value={{ session, loading, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);