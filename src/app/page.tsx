import { redirect } from 'next/navigation';
import { getServerUser, supabaseService } from '@/lib/supabase/server-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const user = await getServerUser();
  if (!user) redirect('/auth/sign-in');

  const sr = supabaseService();
  const { data } = await sr
    .from('profiles')
    .select('is_platform_admin')
    .eq('user_id', user.id)
    .single();

    console.log('[server]/ : role check', { userId: user.id, isAdmin: !!data?.is_platform_admin });

  if (data?.is_platform_admin) redirect('/admin');
  redirect('/dashboard');
}
