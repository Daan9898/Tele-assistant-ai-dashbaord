'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';
import { supabaseBrowser } from '@/lib/supabase/client';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  // optional: if you reuse this in the member dashboard, pass "dashboard"
  scope?: 'admin' | 'dashboard';
}

export function UserPopover({
  anchorEl,
  onClose,
  open,
  scope = 'admin',
}: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useUser();
  const router = useRouter();

  const [displayName, setDisplayName] = React.useState('—');
  const [email, setEmail] = React.useState('—');

  React.useEffect(() => {
    (async () => {
      try {
        const supa = supabaseBrowser();
        const { data: u } = await supa.auth.getUser();
        const uid = u?.user?.id ?? null;

        // email always available from auth user
        const userEmail = u?.user?.email ?? '—';
        setEmail(userEmail);

        // 1) Try profiles.first_name/last_name
        let fullName = '';
        if (uid) {
          const { data: prof } = await supa
            .from('profiles')
            .select('first_name,last_name')
            .eq('user_id', uid)
            .maybeSingle();

          fullName = [prof?.first_name, prof?.last_name].filter(Boolean).join(' ').trim();
        }

        // 2) Fallback to user_metadata.full_name (if you ever set it on sign-up)
        if (!fullName) {
          const metaFull = (u?.user?.user_metadata as any)?.full_name as string | undefined;
          if (metaFull) fullName = metaFull.trim();
        }

        // 3) Final fallback to email
        setDisplayName(fullName || userEmail);
      } catch (e) {
        logger.error('Failed to load user display name', e);
      }
    })();
  }, []);

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        logger.error('Sign out error', error);
        return;
      }
      await checkSession?.();
      router.replace('/auth/sign-in');
    } catch (error) {
      logger.error('Sign out error', error);
    }
  }, [checkSession, router]);

  const p = scope === 'admin' ? paths.admin : paths.dashboard;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{displayName}</Typography>
        <Typography color="text.secondary" variant="body2">
          {email}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={p.settings} onClick={onClose}>
          <ListItemIcon>
            <GearSixIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem component={RouterLink} href={p.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Account
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
