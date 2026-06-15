import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";

type AuthSessionState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<{ error: Error | null }>;
};

export function useAuthSession(): AuthSessionState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return { error: new Error("Supabase 환경변수가 설정되지 않았어요.") };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    loading,
    session,
    user: session?.user ?? null,
    signOut,
  };
}
