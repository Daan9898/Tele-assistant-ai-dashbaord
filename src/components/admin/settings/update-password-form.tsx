'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';

import { supabaseBrowser } from '@/lib/supabase/client';

export function UpdatePasswordForm(): React.JSX.Element {
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);

  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const validate = (): string | null => {
    if (!pw) return 'Password is required';
    if (pw.length < 8) return 'Password must be at least 8 characters';
    if (pw !== pw2) return 'Passwords do not match';
    return null;
    // Add more rules if you like (number/symbol requirement, etc.)
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    try {
      const supa = supabaseBrowser();

      // Ensure we have a session (optional, but gives nicer error if not logged in)
      const { data: sess, error: sessErr } = await supa.auth.getSession();
      if (sessErr || !sess?.session) {
        throw new Error('You are not signed in.');
      }

      const { error } = await supa.auth.updateUser({ password: pw });
      if (error) throw error;

      setOk('Password updated successfully');
      setPw('');
      setPw2('');
    } catch (e: any) {
      setErr(e?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            {ok && <Alert severity="success">{ok}</Alert>}
            {err && <Alert severity="error">{err}</Alert>}

            <FormControl fullWidth>
              <InputLabel>New password</InputLabel>
              <OutlinedInput
                label="New password"
                type={show1 ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShow1((s) => !s)}
                      edge="end"
                    >
                      {show1 ? (
                        <EyeIcon fontSize="var(--icon-fontSize-md)" />
                      ) : (
                        <EyeSlashIcon fontSize="var(--icon-fontSize-md)" />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Confirm password</InputLabel>
              <OutlinedInput
                label="Confirm password"
                type={show2 ? 'text' : 'password'}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShow2((s) => !s)}
                      edge="end"
                    >
                      {show2 ? (
                        <EyeIcon fontSize="var(--icon-fontSize-md)" />
                      ) : (
                        <EyeSlashIcon fontSize="var(--icon-fontSize-md)" />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
