import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { MinutesUsedCard } from '@/components/dashboard/billing/minutes-used';
import { PaymentMethodCard } from '@/components/dashboard/billing/payment-method';
import { InvoiceHistoryCard } from '@/components/dashboard/billing/invoice';

export const metadata = { title: `Billing | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Billing</Typography>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid  size={{
          lg: 6,
          sm: 6,
          xs: 12,
        }}>
          <MinutesUsedCard />
        </Grid>
        <Grid  size={{
          lg: 6,
          sm: 6,
          xs: 12,
        }}>
          <PaymentMethodCard />
        </Grid>
       
      </Grid>
       <Grid>
          <InvoiceHistoryCard />
        </Grid>

      
    </Stack>
  );
}
