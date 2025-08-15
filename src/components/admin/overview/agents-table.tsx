'use client';

import * as React from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

type Agent = {
  id: string;
  org_id: string | null;
  elevenlabs_agent_id: string;
  name: string;
  status: string | null;
};

type Org = { id: string; name: string };

export default function AgentsTable() {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [orgs, setOrgs] = React.useState<Org[]>([]);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ agentId: string | null; orgId: string | null }>({
    agentId: null,
    orgId: null,
  });

  const load = React.useCallback(async () => {
    const supa = supabaseBrowser();
    const [a, o] = await Promise.all([
      supa.from('agents').select('id,org_id,elevenlabs_agent_id,name,status'),
      supa.from('orgs').select('id,name').order('created_at', { ascending: false }),
    ]);
    setAgents(a.data ?? []);
    setOrgs(o.data ?? []);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openAssign = (agentId: string) => {
    setSelected({ agentId, orgId: null });
    setAssignOpen(true);
  };
  const closeAssign = () => {
    setAssignOpen(false);
    setSelected({ agentId: null, orgId: null });
  };

  const confirmAssign = async () => {
    if (!selected.agentId || !selected.orgId) return;
    const supa = supabaseBrowser();
    const { data: sess } = await supa.auth.getSession();
    const token = sess?.session?.access_token;

    const res = await fetch('/.netlify/functions/admin-assign-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ agentId: selected.agentId, orgId: selected.orgId }),
    });

    if (res.ok) {
      closeAssign();
      load();
    } else {
      const json = await res.json().catch(() => ({}));
      alert(json?.error || 'Failed to assign');
    }
  };

  const orgName = (id: string | null) => (id ? orgs.find((o) => o.id === id)?.name ?? `${id.slice(0, 8)}…` : '—');

  return (
    <Card>
      <CardHeader title="Agents" />
      <Divider />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>ElevenLabs ID</TableCell>
            <TableCell>Assigned Org</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {agents.map((a) => (
            <TableRow key={a.id} hover>
              <TableCell>{a.name}</TableCell>
              <TableCell>{a.elevenlabs_agent_id}</TableCell>
              <TableCell>{orgName(a.org_id)}</TableCell>
              <TableCell>
                <Chip size="small" color={a.status === 'active' ? 'success' : 'default'} label={a.status ?? '—'} />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {!a.org_id && (
                    <Button size="small" variant="outlined" onClick={() => openAssign(a.id)}>
                      Assign
                    </Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={assignOpen} onClose={closeAssign} fullWidth maxWidth="sm">
        <DialogTitle>Assign agent to organization</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            select
            label="Organization"
            value={selected.orgId ?? ''}
            onChange={(e) => setSelected((s) => ({ ...s, orgId: e.target.value }))}
          >
            {orgs.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssign}>Cancel</Button>
          <Button variant="contained" onClick={confirmAssign} disabled={!selected.orgId}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
