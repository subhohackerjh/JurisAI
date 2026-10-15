'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import JurisAILogo from '@/components/JurisAILogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submitting = useRef(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg
          className="absolute inset-0 h-full w-full opacity-40 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="loginDotPattern" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#loginDotPattern)" />
        </svg>
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[40%] rounded-full bg-indigo-200/50 blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[35%] rounded-full bg-blue-200/50 blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <JurisAILogo href="/" />
          </div>
          <p className="text-slate-600 font-medium text-sm">India&apos;s unified legal network</p>
        </div>

        <Card className="border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
          <CardHeader className="pb-3 sm:pb-6 text-center sm:text-left">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to manage cases, advocates, and AI legal assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="rounded-xl border-slate-200/80 bg-white/90 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="rounded-xl border-slate-200/80 bg-white/90 h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-full font-semibold shadow-[0_0_20px_rgba(79,70,229,0.25)]"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-600 space-y-2">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign up
            </Link>
          </p>
          <p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
