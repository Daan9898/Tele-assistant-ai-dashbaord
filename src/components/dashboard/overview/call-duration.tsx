// src/components/dashboard/overview/call-duration.tsx
'use client';

import * as React from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Chart } from '@/components/core/chart';
import type { ApexOptions } from 'apexcharts';

export function CallDurationChart(): React.JSX.Element {
  const [chartSeries, setChartSeries] = React.useState<number[]>([]);
  const [counts, setCounts] = React.useState<number[]>([0, 0, 0]);
  const [hasData, setHasData] = React.useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
    const endOfThisMonth = Math.floor(Date.now() / 1000);

    const fetchData = async () => {
      try {
        const res = await axios.get('/.netlify/functions/getConversations', {
          params: {
            start: Math.floor(startOfThisMonth),
            end: Math.floor(endOfThisMonth),
          },
        });

        const durations: number[] = res.data.callDurations || [];

        const short = durations.filter((d: number) => d < 60).length;
        const medium = durations.filter((d: number) => d >= 60 && d <= 120).length;
        const long = durations.filter((d: number) => d > 120).length;

        const total = short + medium + long;

        if (total > 0) {
          const percentages = [short, medium, long].map(n => Math.round((n / total) * 100));
          setChartSeries(percentages);
          setCounts([short, medium, long]);
          setHasData(true);
        } else {
          // fallback single grey slice
          setChartSeries([1]);
          setCounts([0, 0, 0]);
          setHasData(false);
        }
      } catch (error) {
        console.error('Error fetching conversation data:', error);
        // show fallback on error too
        setChartSeries([1]);
        setCounts([0, 0, 0]);
        setHasData(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions: ApexOptions = {
    chart: { background: 'transparent' },
    colors: hasData
      ? [theme.palette.success.main, theme.palette.warning.main, theme.palette.primary.main]
      : [theme.palette.grey[400]],
    labels: hasData ? ['< 1 min', '1–2 min', '> 2 min'] : ['No data'],
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };

  return (
    <Card>
      <CardHeader title="Call Duration Breakdown" />
      <CardContent>
        <Stack spacing={2}>
          <Chart
            height={300}
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width="100%"
          />
          {hasData ? (
            <Stack direction="row" spacing={4} justifyContent="center">
              {['< 1 min', '1–2 min', '> 2 min'].map((label, index) => (
                <Stack key={label} alignItems="center">
                  <Typography variant="h6">{label}</Typography>
                  <Typography color="text.secondary" variant="subtitle2">
                    {counts[index] || 0} calls ({chartSeries[index] || 0}%)
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography align="center" color="text.secondary">
              No call duration data for this period.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
