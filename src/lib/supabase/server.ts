// src/lib/supabase/server-auth.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Read session tied to Next.js cookies (secure; not from localStorage)
export function supabaseServerFromCookies() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
}

// Service role client (server-only) to read profiles/roles
export function supabaseService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function getServerUser() {
  const supa = supabaseServerFromCookies();
  const { data, error } = await supa.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireAdmin() {
  const user = await getServerUser();
  if (!user) return { ok: false, reason: 'no-session' as const };

  const sr = supabaseService();
  const { data, error } = await sr
    .from('profiles')
    .select('is_platform_admin')
    .eq('user_id', user.id)
    .single();

  if (error || !data?.is_platform_admin) return { ok: false, reason: 'not-admin' as const };
  return { ok: true, user };
}
