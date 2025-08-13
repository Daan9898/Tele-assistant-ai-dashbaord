import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
  
import { config } from '@/config';
import { MinutesUsedCard } from '@/components/dashboard/overview/minutes-used';
import { TotalCallsCard } from '@/components/dashboard/overview/total-calls';
import { AverageDurationCard } from '@/components/dashboard/overview/average-duration';
import { PlanUsageCard } from '@/components/dashboard/overview/plan-usage';
import { CallDurationChart } from '@/components/dashboard/overview/call-duration';
import { CallVolumeLineChart } from '@/components/dashboard/overview/monthly-calls';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <MinutesUsedCard />
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <TotalCallsCard />
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <PlanUsageCard />
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <AverageDurationCard />
      </Grid>
      <Grid
        size={{
          lg: 8,
          xs: 12,
        }}
      >
        <CallVolumeLineChart />
      </Grid>
      <Grid
         size={{
          lg: 4,
          md: 6,
          xs: 12,
        }}
      >
        <CallDurationChart/>
      </Grid>
      <Grid
        size={{
          lg: 4,
          md: 6,
          xs: 12,
        }}
      >
      </Grid>
    </Grid>

      
  );
}
