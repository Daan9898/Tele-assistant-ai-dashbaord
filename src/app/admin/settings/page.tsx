import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
//import { Notifications } from '@/components/admin/settings/notifications';
import { UpdatePasswordForm } from '@/components/admin/settings/update-password-form';

export const metadata = { title: `Settings | Admin | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Settings</Typography>
      </div>
      {/* <Notifications /> */}
      <UpdatePasswordForm />
    </Stack>
  );
}
