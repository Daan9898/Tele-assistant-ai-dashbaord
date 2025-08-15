import * as React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { redirect, notFound } from 'next/navigation';

import { requireAdmin } from '@/lib/supabase/server-auth';
import { MainNav } from '@/components/admin/layout/main-nav';
import { SideNav } from '@/components/admin/layout/side-nav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps): Promise<React.JSX.Element> {
  const res = await requireAdmin();
  if (!res.ok) {
    if (res.reason === 'no-session') redirect('/auth/sign-in');
    notFound();
  }

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': '280px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        <SideNav />
        <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
          <MainNav />
          <main>
            <Container maxWidth="xl" sx={{ py: '64px' }}>
              {children}
            </Container>
          </main>
        </Box>
      </Box>
    </>
  );
}
