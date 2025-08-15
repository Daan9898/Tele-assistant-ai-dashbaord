import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.admin.overview, icon: 'chart-pie' },
  //{ key: 'conversations', title: 'Conversations', href: paths.admin.conversations, icon: 'users' },
  //{ key: 'billing', title: 'Billing', href: paths.admin.billing, icon: 'credit-card' },
  { key: 'settings', title: 'Settings', href: paths.admin.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.admin.account, icon: 'user' },
  //{ key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
