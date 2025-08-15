'use client';

import type { User as AppUser } from '@/types/user';
import { createClient } from '@supabase/supabase-js';

function supabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );
}

function toAppUser(u: { id: string; email?: string | null }): AppUser {
  return {
    id: u.id,
    email: u.email ?? '',
    firstName: '',            // you can store real names later
    lastName: '',
    avatar: '/assets/avatar.png',
  };
}

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface SignInWithOAuthParams { provider: 'google' | 'discord'; }
export interface SignInWithPasswordParams { email: string; password: string; }
export interface ResetPasswordParams { email: string; }

class AuthClient {
  async signUp({ email, password }: SignUpParams): Promise<{ error?: string }> {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return error ? { error: error.message } : {};
  }

  async signInWithOAuth({ provider }: SignInWithOAuthParams): Promise<{ error?: string }> {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider, options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return error ? { error: error.message } : {};
  }

  async signInWithPassword({ email, password }: SignInWithPasswordParams): Promise<{ error?: string }> {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }

  async resetPassword({ email }: ResetPasswordParams): Promise<{ error?: string }> {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    return error ? { error: error.message } : {};
  }

  async updatePassword({ password }: { password: string }): Promise<{ error?: string }> {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: error.message } : {};
  }

  async getUser(): Promise<{ data?: AppUser | null; error?: string }> {
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.getUser();
    if (error) return { error: error.message };
    if (!data.user) return { data: null };
    return { data: toAppUser({ id: data.user.id, email: data.user.email }) };
  }

  async signOut(): Promise<{ error?: string }> {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signOut();
    return error ? { error: error.message } : {};
  }
}

export const authClient = new AuthClient();
