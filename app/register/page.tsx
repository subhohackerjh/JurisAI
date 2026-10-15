'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Shield } from 'lucide-react';
import { authApi } from '@/lib/api';
import JurisAILogo from '@/components/JurisAILogo';

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
    law_college: '',
    year_of_study: '',
    graduation_year: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submitting = useRef(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      submitting.current = false;
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      submitting.current = false;
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

      if (formData.role === 'student') {
        payload.law_college = formData.law_college;
        payload.year_of_study = formData.year_of_study || undefined;
        payload.graduation_year = formData.graduation_year ? parseInt(formData.graduation_year) : undefined;
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
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden flex items-center justify-center p-4 sm:p-6 py-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg
          className="absolute inset-0 h-full w-full opacity-40 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="registerDotPattern" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#registerDotPattern)" />
        </svg>
        <div className="absolute top-[-10%] right-[-5%] h-[45%] w-[35%] rounded-full bg-indigo-200/50 blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[45%] w-[35%] rounded-full bg-blue-200/50 blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <JurisAILogo href="/" />
          </div>
          <p className="text-slate-600 font-medium text-sm">Join India&apos;s unified legal network</p>
        </div>

        <Card className="border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Create your account</CardTitle>
            <CardDescription className="text-slate-600">Fill in your details to get started</CardDescription>
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
                      <SelectItem value="student">Law Student</SelectItem>
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

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-secondary/20 border border-border">
                  <h3 className="text-sm font-medium text-foreground">Law Student Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                      <Label className="text-xs sm:text-sm">Law College *</Label>
                      <Input
                        placeholder="e.g., National Law School of India University"
                        value={formData.law_college}
                        onChange={(e) => handleChange('law_college', e.target.value)}
                        disabled={isLoading}
                        required
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Year of Study</Label>
                      <Input
                        placeholder="e.g., 3rd Year"
                        value={formData.year_of_study}
                        onChange={(e) => handleChange('year_of_study', e.target.value)}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Expected Graduation Year</Label>
                      <Input
                        type="number"
                        placeholder="2027"
                        value={formData.graduation_year}
                        onChange={(e) => handleChange('graduation_year', e.target.value)}
                        disabled={isLoading}
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

              <Button type="submit" className="w-full h-11 rounded-full font-semibold shadow-[0_0_20px_rgba(79,70,229,0.25)]" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign in
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
