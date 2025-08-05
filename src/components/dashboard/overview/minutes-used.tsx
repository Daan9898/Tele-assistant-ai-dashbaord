'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import axios from 'axios';

interface ConversationsResponse {
  totalSeconds: number;
  totalCalls: number;
  avgSeconds: number;
}

export function MinutesUsedCard(): React.JSX.Element {
  const [minutesThisMonth, setMinutesThisMonth] = React.useState<number | null>(null);
  const [trend, setTrend] = React.useState<'up' | 'down'>('up');
  const [diff, setDiff] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const now = Math.floor(Date.now() / 1000);
        const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000;
        const [resThis, resLast] = await Promise.all([
          axios.get<ConversationsResponse>('/.netlify/functions/getConversations', { params: { start: Math.floor(startOfThisMonth), end: now } }),
          axios.get<ConversationsResponse>('/.netlify/functions/getConversations', { params: { start: Math.floor(startOfThisMonth - 30 * 24 * 3600), end: Math.floor(startOfThisMonth) - 1 } }),
        ]);
        const minsThis = (resThis.data.totalSeconds || 0) / 60;
        const minsLast = (resLast.data.totalSeconds || 0) / 60;
        setMinutesThisMonth(Number(minsThis.toFixed(1)));
        const change = minsLast === 0 ? 100 : ((minsThis - minsLast) / minsLast) * 100;
        setDiff(Number(change.toFixed(1)));
        setTrend(change >= 0 ? 'up' : 'down');
      } catch (error) {
        console.error('Failed to fetch minutes used:', error);
      }
    }
    fetchData();
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  // Precompute to avoid negated conditions
  const displayMinutes = minutesThisMonth == null ? '...' : `${minutesThisMonth} min`;
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
                Minutes Used
              </Typography>
              <Typography variant="h4">{displayMinutes}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: 56, width: 56 }}>
              <ClockIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {trendSection}
        </Stack>
      </CardContent>
    </Card>
  );
}
