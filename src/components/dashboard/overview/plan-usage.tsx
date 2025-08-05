'use client';

import * as React from 'react';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';

export function PlanUsageCard(): React.JSX.Element {
  const [percentageUsed, setPercentageUsed] = React.useState<number>(0);
  const [color, setColor] = React.useState<'success' | 'warning' | 'error'>('success');
  const [isOverLimit, setIsOverLimit] = React.useState<boolean>(false);

  const PLAN_MINUTES = 200; // ⛔ Hardcoded plan for now

  React.useEffect(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
    const endOfThisMonth = Math.floor(Date.now() / 1000);

    const fetchUsage = async () => {
      try {
        const res = await axios.get('/.netlify/functions/getConversations', {
          params: {
            start: Math.floor(startOfThisMonth),
            end: Math.floor(endOfThisMonth),
          },
        });

        const secondsUsed = res.data?.totalSeconds || 0;
        const minutesUsed = secondsUsed / 60;
        const percentage = (minutesUsed / PLAN_MINUTES) * 100;

        if (percentage > 100) {
          setIsOverLimit(true);
          setPercentageUsed(100);
          setColor('error');
        } else {
          setIsOverLimit(false);
          setPercentageUsed(Number(percentage.toFixed(1)));

          if (percentage >= 80) {
            setColor('error'); // red
          } else if (percentage >= 50) {
            setColor('warning'); // orange
          } else {
            setColor('success'); // green
          }
        }
      } catch (error) {
        console.error('Error fetching plan usage:', error);
      }
    };

    fetchUsage();
  }, []);



  return (
    <Card sx={{ minHeight: '160px' }}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Plan Usage (Used)
              </Typography>
              <Typography variant="h4">
                {isOverLimit ? 'Max Limit' : `${percentageUsed}%`}
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px' }}>
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <LinearProgress  value={percentageUsed} variant="determinate" color={color} />
        </Stack>
      </CardContent>
    </Card>
  );
}
