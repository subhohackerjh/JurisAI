'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Search, FileText, IndianRupee, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiCall } from '@/lib/api';
import { useMyApplications } from '@/hooks/useInternships';
import DashboardHeader from '@/components/DashboardHeader';

export default function StudentDashboard() {
  const { session, logout } = useAuth();
  const { applications, isLoading: applicationsLoading } = useMyApplications();
  const [hasPaidFee, setHasPaidFee] = useState(false);
  const [loadingFee, setLoadingFee] = useState(true);

  useEffect(() => {
    if (session.user?.role === 'student') checkFeeStatus();
  }, [session.user?.role]);

  const checkFeeStatus = async () => {
    setLoadingFee(true);
    const res = await apiCall<any>('/payments/');
    if (res.data) {
      const payments = Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
      setHasPaidFee(payments.some((p: any) => p.payment_for === 'internship_fee' && p.status === 'paid'));
    }
    setLoadingFee(false);
  };

  if (!session.user || session.user.role !== 'student') {
    return null;
  }

  const loading = loadingFee || applicationsLoading;

  const selectedCount = applications.filter(a => a.status === 'selected').length;
  const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'shortlisted').length;

  return (
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 shadow-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">Law Student Portal</span>
          </div>
          <h1 className="legal-page-title">Welcome, {session.user.name}</h1>
          <p className="legal-page-subtitle mt-2">Find internships with advocates and grow your legal career</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Platform fee status */}
            <Card className={hasPaidFee ? 'border-green-200 bg-green-50 mb-6' : 'border-amber-200 bg-amber-50 mb-6'}>
              <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {hasPaidFee ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <IndianRupee className="h-8 w-8 text-amber-600" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {hasPaidFee ? 'Platform fee paid' : 'One-time platform fee required'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasPaidFee
                        ? 'You can apply to any number of internships.'
                        : 'Pay a one-time ₹399 fee to unlock applying to internships.'}
                    </p>
                  </div>
                </div>
                {!hasPaidFee && (
                  <Link href="/dashboard/student/internships">
                    <Button className="rounded-full">Pay ₹399 &amp; Unlock</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Stats grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Applications Sent', value: applications.length, icon: FileText },
                { label: 'Under Review', value: pendingCount, icon: Search },
                { label: 'Selected', value: selectedCount, icon: GraduationCap },
              ].map((stat, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      </div>
                      <stat.icon className="h-8 w-8 text-indigo-600 opacity-30" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Link href="/dashboard/student/internships">
                <Card className="hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                  <CardHeader>
                    <Search className="h-8 w-8 text-indigo-600 mb-2" />
                    <CardTitle className="text-lg">Browse Internships</CardTitle>
                    <CardDescription>Find internships posted by advocates</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/dashboard/student/advocates">
                <Card className="hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                  <CardHeader>
                    <GraduationCap className="h-8 w-8 text-indigo-600 mb-2" />
                    <CardTitle className="text-lg">Nearby Advocates</CardTitle>
                    <CardDescription>Discover advocates near you</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/dashboard/student/applications">
                <Card className="hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                  <CardHeader>
                    <FileText className="h-8 w-8 text-indigo-600 mb-2" />
                    <CardTitle className="text-lg">My Applications</CardTitle>
                    <CardDescription>Track status &amp; download offer letters</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            {/* Recent applications */}
            {applications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Recent Applications</h2>
                <div className="grid gap-4">
                  {applications.slice(0, 3).map((app) => (
                    <Card key={app.id}>
                      <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-medium text-foreground">{app.internship_title}</p>
                          <p className="text-sm text-muted-foreground">{app.advocate_name}</p>
                        </div>
                        <Badge
                          className={
                            app.status === 'selected'
                              ? 'bg-green-100 text-green-800'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : app.status === 'shortlisted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {app.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
