'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { supabaseBrowser } from '@/lib/supabase/client';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

// keep your demo defaults
const defaultValues: Values = { email: 'daansmid@icloud.com', password: 'Test1234' };

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

const onSubmit = React.useCallback(
  async (values: Values): Promise<void> => {
    setIsPending(true);

    try {
      const supa = supabaseBrowser();

      // 1) Sign in and use returned session/user
      const { data, error } = await supa.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error('[client] signIn error', error);
        setError('root', { type: 'server', message: error.message });
        return;
      }

      // Prefer user from signIn result; fallback to getSession()
      let userId: string | null =
        data?.user?.id ?? data?.session?.user?.id ?? null;

      if (!userId) {
        const { data: sess2 } = await supa.auth.getSession();
        userId = sess2?.session?.user?.id ?? null;
        console.log('[client] fallback getSession uid', {
          userId,
          hasSession: !!sess2?.session,
        });
      }

      if (!userId) {
        console.warn('[client] still no uid after fallback, routing /dashboard');
        router.replace('/dashboard');
        return;
      }

      // 2) Role check (now userId is narrowed to string)
      const { data: profile, error: profErr } = await supa
        .from('profiles')
        .select('is_platform_admin')
        .eq('user_id', userId) // ✅ userId is string here
        .single();

      if (profErr) console.error('[client] profile load error', profErr);

      const isAdmin = !!profile?.is_platform_admin;
      console.log('[client] post-login role', { userId, isAdmin });

      router.replace(isAdmin ? '/admin' : '/dashboard');
    } finally {
      setIsPending(false);
    }
  },
  [router, setError]
);



  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        {/* Keep or remove this block if you add self-serve signup later
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography>
        */}
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </form>

      <Alert color="warning">
        Use{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          daansmid@icloud.com
        </Typography>{' '}
        with password{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          Test1234
        </Typography>
      </Alert>
    </Stack>
  );
}
