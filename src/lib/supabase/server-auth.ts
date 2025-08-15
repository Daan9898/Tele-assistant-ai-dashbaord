import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function supabaseServerFromCookies() {
  // Next 14+/15: cookies() must be awaited
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Server Components can't mutate cookies; no-ops are fine
        set() {},
        remove() {},
      },
    }
  );
}

export function supabaseService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ✅ Use getSession() (no refresh) to avoid "Invalid Refresh Token"
export async function getServerUser() {
  const supa = await supabaseServerFromCookies();
  const { data, error } = await supa.auth.getSession();
  if (error || !data?.session) return null;
  return data.session.user;
}

export async function requireAdmin() {
  const user = await getServerUser();
  if (!user) return { ok: false as const, reason: 'no-session' as const };

  const sr = supabaseService();
  const { data, error } = await sr
    .from('profiles')
    .select('is_platform_admin')
    .eq('user_id', user.id)
    .single();

  if (error || !data?.is_platform_admin) {
    return { ok: false as const, reason: 'not-admin' as const };
  }
  return { ok: true as const, user };
}
