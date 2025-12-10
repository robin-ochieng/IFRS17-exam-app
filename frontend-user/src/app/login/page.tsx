'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, user, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isInitialized && user) {
      console.log('Login: Already authenticated, redirecting to', redirectTo);
      router.push(redirectTo);
    }
  }, [isInitialized, user, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Login: Starting sign in...');
    
    try {
      const { error } = await signIn(email, password);
      
      console.log('Login: Sign in completed, error:', error);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // signIn now directly updates user state, so redirect immediately
      console.log('Login: Sign in successful, redirecting to', redirectTo);
      router.push(redirectTo);
    } catch (err) {
      console.error('Login: Unexpected error:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl shadow-blue-900/5 border-0">
        <CardHeader className="text-center pt-8 pb-2">
          <div className="mx-auto mb-6">
            <Image
              src="/IRA logo.png"
              alt="IRA Logo"
              width={200}
              height={60}
              className="h-16 w-auto"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-500 mt-2">
            Sign in to access the IFRS 17 Exam Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 font-semibold"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm">
            <span className="text-gray-500">Don&apos;t have an account? </span>
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
