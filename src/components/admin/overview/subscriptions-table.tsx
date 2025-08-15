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

type Sub = {
  org_id: string;
  plan: 'basic' | 'pro' | 'enterprise';
  included_minutes: number;
  start_date: string | null;
};
type Org = { id: string; name: string };

export default function SubscriptionsTable() {
  const [rows, setRows] = React.useState<Array<Sub & { org_name: string }>>([]);

  React.useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const [s, o] = await Promise.all([
        supa.from('subscriptions').select('org_id,plan,included_minutes,start_date'),
        supa.from('orgs').select('id,name'),
      ]);

      const orgMap: Record<string, string> = {};
      (o.data ?? []).forEach((r: Org) => {
        orgMap[r.id] = r.name;
      });

      const data = (s.data ?? []).map((r: Sub) => ({
        ...r,
        org_name: orgMap[r.org_id] ?? r.org_id.slice(0, 8) + '…',
      }));

      setRows(data);
    })();
  }, []);

  return (
    <Card>
      <CardHeader title="Subscriptions" />
      <Divider />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Org</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Included minutes</TableCell>
            <TableCell>Start date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={`${r.org_id}-${r.plan}`} hover>
              <TableCell>{r.org_name}</TableCell>
              <TableCell>
                <Chip size="small" label={r.plan} />
              </TableCell>
              <TableCell>{r.included_minutes}</TableCell>
              <TableCell>{r.start_date ? new Date(r.start_date).toLocaleDateString() : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
