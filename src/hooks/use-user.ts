'use client';

import * as React from 'react';
import { UserContext, type UserContextValue } from '@/contexts/user-context';

export function useUser(): UserContextValue {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
