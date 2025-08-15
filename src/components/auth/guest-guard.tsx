'use client';

import * as React from 'react';
import { useUser } from '@/hooks/use-user';

type Props = { children: React.ReactNode };

// Renders children even if the user is logged in.
// We will handle the post-login redirect in the SignInForm submit handler.
export function GuestGuard({ children }: Props): React.JSX.Element {
  // Keep for potential "already logged in" banners, but do not redirect.
  // const { user, isLoading } = useUser();
  return <>{children}</>;
}
