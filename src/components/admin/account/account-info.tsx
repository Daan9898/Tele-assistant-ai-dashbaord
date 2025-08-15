'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { supabaseBrowser } from '@/lib/supabase/client';

export function AccountInfo(): React.JSX.Element {
  const [state, setState] = React.useState<{
    name: string;
    avatar: string | null;
    city?: string | null;
    country?: string | null;
    timezone?: string | null;
  }>({ name: '—', avatar: null });

  React.useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data: u } = await supa.auth.getUser();
      const uid = u?.user?.id;
      const email = u?.user?.email ?? '';
      if (!uid) return;

      const { data: p } = await supa
        .from('profiles')
        .select('first_name,last_name,avatar_url,city,country,timezone')
        .eq('user_id', uid)
        .maybeSingle();

      const full = [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim() || email;
      setState({
        name: full,
        avatar: p?.avatar_url ?? null,
        city: p?.city ?? null,
        country: p?.country ?? null,
        timezone: p?.timezone ?? null,
      });
    })();
  }, []);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={state.avatar ?? '/assets/avatar.png'} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{state.name}</Typography>
            {(state.city || state.country) && (
              <Typography color="text.secondary" variant="body2">
                {[state.city, state.country].filter(Boolean).join(', ')}
              </Typography>
            )}
            {state.timezone && (
              <Typography color="text.secondary" variant="body2">
                {state.timezone}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text" disabled>
          Upload picture (soon)
        </Button>
      </CardActions>
    </Card>
  );
}
