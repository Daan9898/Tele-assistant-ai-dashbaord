'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { TimerIcon } from '@phosphor-icons/react/dist/ssr/Timer';
import axios from 'axios';

interface ConversationsResponse {
  totalSeconds: number;
  totalCalls: number;
  avgSeconds: number;
}

export function AverageDurationCard(): React.JSX.Element {
  const [avgDuration, setAvgDuration] = React.useState<number | null>(null);
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
        const resThisMonth = await axios.get<ConversationsResponse>('/.netlify/functions/getConversations', {
          params: {
            start: Math.floor(startOfThisMonth),
            end: Math.floor(endOfThisMonth),
          },
        });

        const resLastMonth = await axios.get<ConversationsResponse>('/.netlify/functions/getConversations', {
          params: {
            start: Math.floor(startOfLastMonth),
            end: Math.floor(endOfLastMonth),
          },
        });

        const avgThis = resThisMonth.data?.avgSeconds || 0;
        const avgLast = resLastMonth.data?.avgSeconds || 0;

        setAvgDuration(Number(avgThis.toFixed(1)));

        const change = avgLast === 0 ? 100 : ((avgThis - avgLast) / avgLast) * 100;
        setDiff(Number(change.toFixed(1)));
        setTrend(change >= 0 ? 'up' : 'down');
      } catch (error) {
        console.error('Failed to fetch average call duration:', error);
      }
    };

    fetchData();
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Avg. Duration
              </Typography>
              <Typography variant="h4">
                {avgDuration !== null ? `${avgDuration}s` : '...'}
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: 56, width: 56 }}>
              <TimerIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff !== null && (
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
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}