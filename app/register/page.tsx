'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Shield } from 'lucide-react';
import { authApi } from '@/lib/api';
import Legal24Logo from '@/components/Legal24Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'customer',
    phone: '',
    password: '',
    password_confirm: '',
    specialization: '',
    experience_years: '',
    bar_council_id: '',
    badge_number: '',
    station: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined,
        password: formData.password,
        password_confirm: formData.password_confirm,
      };

      // Add role-specific fields
      if (formData.role === 'advocate') {
        payload.specialization = formData.specialization;
        payload.experience_years = formData.experience_years ? parseInt(formData.experience_years) : undefined;
        payload.bar_council_id = formData.bar_council_id;
      }

      if (formData.role === 'police') {
        payload.badge_number = formData.badge_number;
        payload.station = formData.station;
      }

      const response = await authApi.register(payload);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Registration successful, redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <Legal24Logo />
          <div>
            <h1 className="text-2xl font-bold text-foreground">LEGAL 24</h1>
            <p className="text-sm text-muted-foreground">Your trusted legal services platform</p>
          </div>
        </div>

        {/* Register Card */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Create Account</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="p-2.5 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={isLoading}
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={isLoading}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Phone (Optional)</Label>
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange('role', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="advocate">Advocate</SelectItem>
                      <SelectItem value="police">Police Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advocate-specific fields */}
              {formData.role === 'advocate' && (
                <>
                  <div className="p-3 sm:p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex gap-2 sm:gap-3">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                          Advocate Registration Requires Approval
                        </p>
                        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                          Your registration will be reviewed by an admin. Your Bar Council ID will be verified before approval. You will be able to login once approved.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-secondary/20 border border-border">
                    <h3 className="text-sm font-medium text-foreground">Advocate Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Specialization</Label>
                        <Input
                          placeholder="e.g., Criminal Law"
                          value={formData.specialization}
                          onChange={(e) => handleChange('specialization', e.target.value)}
                          disabled={isLoading}
                          required
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Experience (Years)</Label>
                        <Input
                          type="number"
                          placeholder="5"
                          value={formData.experience_years}
                          onChange={(e) => handleChange('experience_years', e.target.value)}
                          disabled={isLoading}
                          required
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                        <Label className="text-xs sm:text-sm">Bar Council ID *</Label>
                        <Input
                          placeholder="e.g., BAR/1234/2020"
                          value={formData.bar_council_id}
                          onChange={(e) => handleChange('bar_council_id', e.target.value)}
                          disabled={isLoading}
                          required
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will be verified by admin before approval
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Police-specific fields */}
              {formData.role === 'police' && (
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-secondary/20 border border-border">
                  <h3 className="text-sm font-medium text-foreground">Police Officer Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Badge Number</Label>
                      <Input
                        placeholder="e.g., POL/5678"
                        value={formData.badge_number}
                        onChange={(e) => handleChange('badge_number', e.target.value)}
                        disabled={isLoading}
                        required
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Station</Label>
                      <Input
                        placeholder="e.g., Central Police Station"
                        value={formData.station}
                        onChange={(e) => handleChange('station', e.target.value)}
                        disabled={isLoading}
                        required
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Password</Label>
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    disabled={isLoading}
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.password_confirm}
                    onChange={(e) => handleChange('password_confirm', e.target.value)}
                    disabled={isLoading}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/" className="text-primary hover:underline font-medium">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
