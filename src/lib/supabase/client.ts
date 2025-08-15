'use client';

import { createBrowserClient } from '@supabase/ssr';
import { parse, serialize } from 'cookie';

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const all = parse(document.cookie ?? '');
          return all[name];
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return;
          // sensible defaults for auth cookies
          const cookie = serialize(name, value, {
            path: '/',
            sameSite: 'lax',
            ...options,
          });
          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return;
          const cookie = serialize(name, '', {
            path: '/',
            maxAge: 0,
            sameSite: 'lax',
            ...options,
          });
          document.cookie = cookie;
        },
      },
    }
  );
}
