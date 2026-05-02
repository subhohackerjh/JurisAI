'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Legal24Logo from '@/components/Legal24Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <Legal24Logo />
          <div>
            <h1 className="text-2xl font-bold text-foreground">LEGAL 24</h1>
            <p className="text-sm text-muted-foreground">Your trusted legal services platform</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Sign In</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="p-2.5 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-sm"
                />
              </div>

              <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>


        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground space-y-2">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <p>
            <Link href="/" className="text-primary hover:underline font-medium">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
