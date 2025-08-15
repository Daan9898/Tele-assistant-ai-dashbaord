'use client';

import * as React from 'react';
import { createClient } from '@supabase/supabase-js';

export type UserContextValue = {
  user: { id: string; email?: string | null } | null;
  isLoading: boolean;
  error?: string;
  checkSession?: () => Promise<void>;
};

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

function supabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserContextValue['user']>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const supabase = React.useMemo(() => supabaseBrowser(), []);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    // 1) Read session first — "no session" is NOT an error
    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) {
      setError(sessErr.message);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const session = sessData?.session ?? null;
    if (!session) {
      // Logged out: this is fine; don't show an error
      setUser(null);
      setIsLoading(false);
      return;
    }

    // 2) We have a session → use it (no need to call getUser)
    const u = session.user;
    setUser(u ? { id: u.id, email: u.email } : null);
    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    // initial load
    refresh();

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh, supabase]);

  const value: UserContextValue = { user, isLoading, error, checkSession: refresh };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
