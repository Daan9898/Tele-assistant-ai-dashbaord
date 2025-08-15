'use client';

import * as React from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

type Plan = 'basic' | 'pro' | 'enterprise';

export default function CreateClientForm() {
  const [values, setValues] = React.useState({
    email: '',
    password: '',
    orgName: '',
    plan: 'basic' as Plan,
    agentId: '',
    agentName: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      const supa = supabaseBrowser();
      const { data: sess } = await supa.auth.getSession();
      const accessToken = sess?.session?.access_token;

      const res = await fetch('/.netlify/functions/admin-create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(values),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to create client');

      setOkMsg(`Created ✓ Org ID: ${json.orgId}`);
      setValues((v) => ({ ...v, password: '' }));
    } catch (err: any) {
      setErrMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Create Client" subheader="Create user, org, subscription and assign agent" />
      <CardContent>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            {okMsg && <Alert severity="success">{okMsg}</Alert>}
            {errMsg && <Alert severity="error">{errMsg}</Alert>}

            <TextField name="email" label="Client email" value={values.email} onChange={onChange} required />
            <TextField
              name="password"
              label="Temporary password"
              type="password"
              value={values.password}
              onChange={onChange}
              required
            />
            <TextField name="orgName" label="Organization name" value={values.orgName} onChange={onChange} required />
            <TextField name="plan" select label="Plan" value={values.plan} onChange={onChange}>
              <MenuItem value="basic">Basic (600 min)</MenuItem>
              <MenuItem value="pro">Pro (1100 min)</MenuItem>
              <MenuItem value="enterprise">Enterprise (3600 min)</MenuItem>
            </TextField>
            <TextField
              name="agentId"
              label="ElevenLabs Agent ID"
              value={values.agentId}
              onChange={onChange}
              required
            />
            <TextField
              name="agentName"
              label="Agent display name (optional)"
              value={values.agentName}
              onChange={onChange}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : undefined}
            >
              {loading ? 'Creating…' : 'Create client'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
