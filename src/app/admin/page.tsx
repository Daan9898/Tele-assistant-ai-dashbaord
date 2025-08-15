// src/app/admin/page.tsx
import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import CreateClientForm from '@/components/admin/overview/create-client-form';
import OrgsTable from '@/components/admin/overview/orgs-table';
import AgentsTable from '@/components/admin/overview/agents-table';
import SubscriptionsTable from '@/components/admin/overview/subscriptions-table';

// These are fine on a page, but not required; leaving to avoid caching.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminPage(): React.JSX.Element {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CreateClientForm />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SubscriptionsTable />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <OrgsTable />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <AgentsTable />
        </Grid>
      </Grid>

      <Divider sx={{ mt: 4 }} />
    </>
  );
}
