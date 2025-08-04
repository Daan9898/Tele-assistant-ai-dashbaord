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

export function CallVolumeLineChart(): React.JSX.Element {
  const theme = useTheme();
  const [series, setSeries] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    const now = new Date();

    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    const fetchCalls = async (start: Date, end: Date) => {
      const res = await axios.get('/.netlify/functions/getConversations', {
        params: {
          start: Math.floor(start.getTime() / 1000),
          end: Math.floor(end.getTime() / 1000),
        },
      });

      return res.data.callsPerDay || {};
    };

    const buildChart = async () => {
      const [thisMonthData, lastMonthData] = await Promise.all([
        fetchCalls(startOfThisMonth, endOfThisMonth),
        fetchCalls(startOfLastMonth, endOfLastMonth),
      ]);

      const thisMonthDays = eachDayOfInterval({ start: startOfThisMonth, end: endOfThisMonth });
      const lastMonthDays = eachDayOfInterval({ start: startOfLastMonth, end: endOfLastMonth });

      const labels = thisMonthDays.map((date, i) => {
        const isSunday = date.getDay() === 0;
        if (!isSunday) return '';
        
        const day = format(date, 'dd');
        const label = i === 0 ? format(date, 'dd MMM') : day;
        return label;
      });

      const thisMonthSeries = thisMonthDays.map(date => {
        const key = format(date, 'yyyy-MM-dd');
        return thisMonthData[key] || 0;
      });

      const lastMonthSeries = thisMonthDays.map((_, i) => {
        const match = lastMonthDays[i];
        if (!match) return 0;
        const key = format(match, 'yyyy-MM-dd');
        return lastMonthData[key] || 0;
      });

      setCategories(labels);
      setSeries([
        { name: 'This Month', data: thisMonthSeries },
        { name: 'Last Month', data: lastMonthSeries },
      ]);
    };

    buildChart();
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
        formatter: value => `${value}`,
        style: { colors: theme.palette.text.secondary },
      },
    },
    tooltip: {
      x: { format: 'MMM dd' },
      y: { formatter: value => `${value} calls` },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '14px',
    },
    theme: { mode: theme.palette.mode },
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
