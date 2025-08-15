'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import { supabaseBrowser } from '@/lib/supabase/client';

export function AccountDetailsForm(): React.JSX.Element {
  const [values, setValues] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
  });
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data: u } = await supa.auth.getUser();
      const uid = u?.user?.id;
      const email = u?.user?.email ?? '';
      if (!uid) return;

      const { data: p } = await supa
        .from('profiles')
        .select('first_name,last_name,phone,city')
        .eq('user_id', uid)
        .maybeSingle();

      setValues({
        first_name: p?.first_name ?? '',
        last_name: p?.last_name ?? '',
        email,
        phone: p?.phone ?? '',
        city: p?.city ?? '',
      });
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);

    try {
      const supa = supabaseBrowser();
      const { data: u } = await supa.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error('No user');

      // 1) Update profile fields
      const payload = {
        user_id: uid,
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        phone: values.phone || null,
        city: values.city || null,
        updated_at: new Date().toISOString(),
      };
      const { error: upErr } = await supa.from('profiles').upsert(payload);
      if (upErr) throw upErr;

      // 2) (Optional) Update email if changed
      if (values.email && values.email !== (u?.user?.email ?? '')) {
        const { error: emailErr } = await supa.auth.updateUser({ email: values.email });
        if (emailErr) throw emailErr;
      }

      setOk('Profile saved');
    } catch (e: any) {
      setErr(e.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            {ok && <Alert severity="success">{ok}</Alert>}
            {err && <Alert severity="error">{err}</Alert>}
          </Stack>

          <Grid container spacing={3}>
            <Grid
                size={{
                  md: 6,
                  xs: 12,
                }}
              >              
              <FormControl fullWidth required>
                <InputLabel>First name</InputLabel>
                <OutlinedInput
                  name="first_name"
                  label="First name"
                  value={values.first_name}
                  onChange={onChange}
                />
              </FormControl>
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >  
              <FormControl fullWidth required>
                <InputLabel>Last name</InputLabel>
                <OutlinedInput
                  name="last_name"
                  label="Last name"
                  value={values.last_name}
                  onChange={onChange}
                />
            </FormControl>
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >  
              <FormControl fullWidth required>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput
                  name="email"
                  label="Email address"
                  type="email"
                  value={values.email}
                  onChange={onChange}
                />
            </FormControl>
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >  
              <FormControl fullWidth>
                <InputLabel>Phone number</InputLabel>
                <OutlinedInput
                  name="phone"
                  label="Phone number"
                  type="tel"
                  value={values.phone}
                  onChange={onChange}
                />
              </FormControl>
            </Grid>

            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >  
              <FormControl fullWidth>
                <InputLabel>City</InputLabel>
                <OutlinedInput
                  name="city"
                  label="City"
                  value={values.city}
                  onChange={onChange}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save details'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
