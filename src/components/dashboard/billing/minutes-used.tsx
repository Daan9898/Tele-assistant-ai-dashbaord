'use client';

import * as React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';

const planLimit = 600;
const pricePerExtraMinute = 0.2;

export function MinutesUsedCard(): React.JSX.Element {
  const [minutesThisMonth, setMinutesThisMonth] = React.useState<number | null>(null);
  const [extraMinutes, setExtraMinutes] = React.useState<number>(0);
  const [percentageUsed, setPercentageUsed] = React.useState<number>(0);
  const [statusColor, setStatusColor] = React.useState<'success' | 'warning' | 'error'>('success');

  const currentMonthLabel = dayjs().format('MMMM YYYY');

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

        const totalMinutes = (res.data?.totalSeconds || 0) / 60;
        const roundedMinutes = Number(totalMinutes.toFixed(1));
        setMinutesThisMonth(roundedMinutes);
        const over = Math.max(0, roundedMinutes - planLimit);
        setExtraMinutes(Math.ceil(over));

        const pct = (roundedMinutes / planLimit) * 100;
        const capped = Math.min(pct, 100);
        setPercentageUsed(Number(capped.toFixed(1)));

        if (roundedMinutes > planLimit) {
          setStatusColor('error');
        } else if (pct >= 80) {
          setStatusColor('warning');
        } else {
          setStatusColor('success');
        }
      } catch (err) {
        console.error('Error fetching usage data:', err);
      }
    };

    fetchData();
  }, []);

  const overageCost = extraMinutes * pricePerExtraMinute;

  return (
    <Card sx={{ minHeight: '220px' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header like credit card: title + month */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Minutes Used This Month
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentMonthLabel}
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1}>
              <Typography variant="h4">
                {minutesThisMonth !== null
                  ? `${Math.min(minutesThisMonth, planLimit)} / ${planLimit} min`
                  : '...'}
              </Typography>
              {extraMinutes > 0 && (
                <Typography variant="body2" color="error">
                  +{extraMinutes} min over plan • €{overageCost.toFixed(2)} extra
                </Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: 56, width: 56 }}>
              <ClockIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>

          <Box>
            <LinearProgress
              variant="determinate"
              value={percentageUsed}
              sx={{
                height: 8,
                borderRadius: 4,
                [`& .MuiLinearProgress-bar`]: {
                  transition: 'width .3s ease',
                },
              }}
              color={statusColor}
            />
            <Stack direction="row" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                Plan limit: {planLimit} min
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {minutesThisMonth !== null
                  ? `${Math.min(minutesThisMonth, planLimit)} / ${planLimit} min used`
                  : 'Loading...'}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              €{pricePerExtraMinute.toFixed(2)} per extra minute after {planLimit} min
            </Typography>
            <Button variant="outlined" size="small">
              Upgrade Plan
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
