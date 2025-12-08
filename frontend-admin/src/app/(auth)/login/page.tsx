'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button, Input, Card, CardBody, Alert, LoadingSpinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!authData.user) {
        setError('An unexpected error occurred. Please try again.');
        return;
      }

      // Check if user has admin privileges
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single<{ role: string }>();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError('Unable to verify user profile. Please contact support.');
        return;
      }

      const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
      
      if (!isAdmin) {
        await supabase.auth.signOut();
        setError('Access denied. Admin privileges are required to access this dashboard.');
        return;
      }

      // Redirect to dashboard
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Login Card */}
      <Card>
        <CardBody className="p-6">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500">
        Not an admin?{' '}
        <Link
          href={process.env.NEXT_PUBLIC_USER_PORTAL_URL || '#'}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Go to Student Portal
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Logo and Header */}
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          IRA IFRS 17 Examination System
        </p>
      </div>

      {/* Login Form - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
