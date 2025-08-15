export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    conversations: '/dashboard/conversations',
    billing: '/dashboard/billing',
    settings: '/dashboard/settings',
  },
  admin: {
    overview: '/admin',
    account: '/admin/account',
    conversations: '/admin/conversations',
    billing: '/admin/billing',
    settings: '/admin/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
