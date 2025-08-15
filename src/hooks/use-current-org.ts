'use client';

import * as React from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Org = { id: string; name: string };

export function useCurrentOrg() {
  const [org, setOrg] = React.useState<Org | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const supa = supabaseBrowser();
        const { data, error } = await supa
          .from('orgs')
          .select('id, name')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          // optional: handle/log error
        }

        if (mounted) setOrg(data?.[0] ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { org, loading };
}
