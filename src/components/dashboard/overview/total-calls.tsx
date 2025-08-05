'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import axios from 'axios';

interface ConversationsResponse {
  totalSeconds: number;
  totalCalls: number;
  avgSeconds: number;
}

export function TotalCallsCard(): React.JSX.Element {
  const [callsThisMonth, setCallsThisMonth] = React.useState<number | null>(null);
  const [trend, setTrend] = React.useState<'up' | 'down'>('up');
  const [diff, setDiff] = React.useState<number | null>(null);

  React.useEffect(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
    const endOfThisMonth = Math.floor(Date.now() / 1000);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000;
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime() / 1000;

    const fetchData = async () => {
      try {
        const [{ data: thisData }, { data: lastData }] = await Promise.all([
          axios.get<ConversationsResponse>('/.netlify/functions/getConversations', {
            params: { start: Math.floor(startOfThisMonth), end: Math.floor(endOfThisMonth) },
          }),
          axios.get<ConversationsResponse>('/.netlify/functions/getConversations', {
            params: { start: Math.floor(startOfLastMonth), end: Math.floor(endOfLastMonth) },
          }),
        ]);

        const thisMonth = thisData.totalCalls ?? 0;
        const lastMonth = lastData.totalCalls ?? 0;

        setCallsThisMonth(thisMonth);

        const change = lastMonth === 0 ? 100 : ((thisMonth - lastMonth) / lastMonth) * 100;
        setDiff(Number(change.toFixed(1)));
        setTrend(change >= 0 ? 'up' : 'down');
      } catch (error) {
        console.error('Failed to fetch call data:', error);
      }
    };

    fetchData();
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  // Precompute display
  const displayCalls = callsThisMonth == null ? '...' : `${callsThisMonth}`;
  const trendSection = diff == null ? null : (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
        <Typography color={trendColor} variant="body2">
          {Math.abs(diff)}%
        </Typography>
      </Stack>
      <Typography color="text.secondary" variant="caption">
        Since last month
      </Typography>
    </Stack>
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Calls
              </Typography>
              <Typography variant="h4">{displayCalls}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: 56, width: 56 }}>
              <PhoneIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {trendSection}
        </Stack>
      </CardContent>
    </Card>
  );
}
