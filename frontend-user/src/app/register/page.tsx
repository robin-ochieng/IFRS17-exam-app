'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, fullName, company);
      
      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-xl shadow-blue-900/5 border-0">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Registration Successful!</CardTitle>
            <CardDescription className="text-gray-500 mt-2">
              Please check your email to confirm your account before signing in.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25 font-semibold"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-500 mt-2">
            Register to take the IRA IFRS 17 Exam
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
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name"
            />

            <Input
              label="Company / Organization"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Insurance Company Ltd."
              autoComplete="organization"
            />
            
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
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 font-semibold"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
