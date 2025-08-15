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

type Org = { id: string; name: string; created_at: string };

export default function OrgsTable() {
  const [rows, setRows] = React.useState<Org[]>([]);

  React.useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data } = await supa.from('orgs').select('id,name,created_at').order('created_at', { ascending: false });
      setRows(data ?? []);
    })();
  }, []);

  return (
    <Card>
      <CardHeader title="Organizations" />
      <Divider />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Org ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.id.slice(0, 8)}…</TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>
                <Chip size="small" label={new Date(r.created_at).toLocaleString()} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
