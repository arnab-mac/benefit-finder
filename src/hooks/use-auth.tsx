import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; session: Session | null; ready: boolean };

const AuthContext = createContext<AuthState>({ user: null, session: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, ready: false });
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ user: session?.user ?? null, session, ready: true });
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event === "SIGNED_IN") {
        const next = window.sessionStorage.getItem("ss-after-login");
        window.sessionStorage.removeItem("ss-after-login");
        if (next && next.startsWith("/") && !next.startsWith("//")) router.history.push(next);
      }
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries({ queryKey: ["account"] });
    });
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, ready: true });
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
