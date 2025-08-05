'use client';

import * as React from 'react';
import axios from 'axios';
import { format, subMonths, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';

// Define the shape of calls per day response
interface CallsPerDayResponse {
  callsPerDay: Record<string, number>;
}

export function CallVolumeLineChart(): React.JSX.Element {
  const theme = useTheme();
  const [series, setSeries] = React.useState<{ name: string; data: number[] }[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function fetchCalls(start: Date, end: Date): Promise<Record<string, number>> {
      const response = await axios.get<CallsPerDayResponse>('/.netlify/functions/getConversations', {
        params: {
          start: Math.floor(start.getTime() / 1000),
          end: Math.floor(end.getTime() / 1000),
        },
      });
      return response.data.callsPerDay;
    }

    async function buildChartData() {
      const now = new Date();
      const startThis = startOfMonth(now);
      const endThis = endOfMonth(now);
      const startLast = startOfMonth(subMonths(now, 1));
      const endLast = endOfMonth(subMonths(now, 1));

      const [thisMonthData, lastMonthData] = await Promise.all([
        fetchCalls(startThis, endThis),
        fetchCalls(startLast, endLast),
      ]);

      const thisDays = eachDayOfInterval({ start: startThis, end: endThis });
      const lastDays = eachDayOfInterval({ start: startLast, end: endLast });

      const labels = thisDays.map((date, index) => {
        const isSunday = date.getDay() === 0;
        if (!isSunday) {
          return '';
        }
        return index === 0 ? format(date, 'dd MMM') : format(date, 'dd');
      });

      const thisSeriesData = thisDays.map((date) => {
        const key = format(date, 'yyyy-MM-dd');
        return thisMonthData[key] ?? 0;
      });

      const lastSeriesData = thisDays.map((_, idx) => {
        const match = lastDays[idx];
        if (!match) {
          return 0;
        }
        const key = format(match, 'yyyy-MM-dd');
        return lastMonthData[key] ?? 0;
      });

      setCategories(labels);
      setSeries([
        { name: 'This Month', data: thisSeriesData },
        { name: 'Last Month', data: lastSeriesData },
      ]);
    }

    buildChartData();
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      type: 'line',
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: [theme.palette.primary.main, theme.palette.grey[400]],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}`,
        style: { colors: theme.palette.text.secondary },
      },
    },
    tooltip: {
      x: { format: 'MMM dd' },
      y: { formatter: (value) => `${value} calls` },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '14px',
    },
    theme: { mode: theme.palette.mode as 'light' | 'dark' },
  };

  return (
    <Card>
      <CardHeader title="Call Volume Per Day" />
      <CardContent>
        <Chart height={350} options={chartOptions} series={series} type="line" width="100%" />
      </CardContent>
    </Card>
  );
}
