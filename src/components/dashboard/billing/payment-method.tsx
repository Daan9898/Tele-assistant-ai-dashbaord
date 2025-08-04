'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';

interface StoredCard {
  holder: string;
  numberMasked: string;
  expiry: string;
  brand: string;
  activeUntil: string;
}

const card: StoredCard = {
  holder: 'AZUNYAN U WU',
  numberMasked: '0087 1157 0587 6187',
  expiry: '08/11',
  brand: 'VISA',
  activeUntil: '25 Jan 2027',
};

export function PaymentMethodCard(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card>
      <CardHeader
        title="Payment Method"
        subheader={`Active until ${card.activeUntil}`}
        sx={{ pb: 0 }}
        action={
          <Box>
            <Box
              sx={{
                borderRadius: 1,
                backgroundColor: '#E6F7F0',
                px: 2,
                py: 0.75,
                display: 'inline-block',
              }}
            >
              <Typography variant="body2" sx={{ color: '#006B4E', fontWeight: 600 }}>
                Auto-payment enabled
              </Typography>
            </Box>
          </Box>
        }
      />
      <CardContent>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            p: 3,
            bgcolor: theme.palette.background.paper,
            boxShadow: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.04)} 0%, ${alpha(
              theme.palette.grey[100],
              0.08
            )} 60%)`,
          }}
        >
          {/* Subtle pattern */}
          <Box
            component="svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.07,
            }}
          >
            <defs>
              <pattern
                id="lines4"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(15)"
              >
                <line x1="0" y="0" x2="0" y2="20" stroke={theme.palette.grey[300]} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lines4)" />
          </Box>

          {/* Edit button */}
          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
            <Button variant="outlined" size="small" startIcon={<PencilSimple size={16} />}>
              Edit
            </Button>
          </Box>

          {/* Branding */}
          <Typography variant="caption" fontWeight={600} sx={{ position: 'relative', zIndex: 1 }}>
            slothui
          </Typography>

          {/* Card number line */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              position: 'relative',
              zIndex: 1,
              fontFamily: 'monospace',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                letterSpacing: 1,
                mb: 0,
                flexGrow: 1,
              }}
            >
              {card.numberMasked}
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ height: 4 }} />

          {/* Cardholder on left, and on right expiry + brand in same row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cardholder
              </Typography>
              <Typography variant="body2">{card.holder}</Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={card.brand}
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[100], 0.9),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Expiry
                </Typography>
                <Typography variant="body2">{card.expiry}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
