'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Star, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { casesApi, profileApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { useState, useEffect } from 'react';

export default function AdvocateDashboard() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!session.user || session.user.role !== 'advocate') {
    return null;
  }

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile and cases in parallel
      const [profileRes, casesRes] = await Promise.all([
        profileApi.getProfile(),
        casesApi.listCases(),
      ]);

      if (profileRes.data && !profileRes.error) {
        setProfile(profileRes.data);
      }

      if (casesRes.data && !casesRes.error) {
        // Backend already filters by advocate for this role — just unpack pagination
        const data = casesRes.data as any;
        setCases(Array.isArray(data) ? data : (data.results ?? []));
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader user={session.user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading dashboard...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <DashboardHeader user={session.user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Error: {error}</p>
              <Button onClick={loadDashboardData} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 shadow-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">Advocate Portal</span>
          </div>
          <h1 className="legal-page-title">Welcome, {profile?.name || 'Advocate'}</h1>
          <p className="legal-page-subtitle mt-2">Manage your cases and client interactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Cases', value: cases.length, icon: FileText },
            { label: 'Experience', value: `${profile?.experience_years || 0}y`, icon: TrendingUp },
            { label: 'Specialization', value: profile?.specialization || 'N/A', icon: Star },
            { label: 'Status', value: profile?.approval_status || 'Unknown', icon: Clock },
          ].map((stat, idx) => (
            <Card key={idx} className="">
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

        {/* Cases Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your Cases</h2>
            <p className="text-sm text-muted-foreground">Active cases assigned to you</p>
          </div>

          {cases.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No cases assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {cases.map((caseData) => (
                <Link key={caseData.id} href={`/dashboard/case/${caseData.id}`}>
                  <Card className="hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{caseData.title}</CardTitle>
                          <CardDescription>Case #{caseData.id}</CardDescription>
                        </div>
                        <Badge
                          className={
                            caseData.status === 'closed'
                              ? 'bg-green-100 text-green-800'
                              : caseData.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {caseData.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Case Type</p>
                          <p className="font-medium text-foreground">{caseData.case_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Client</p>
                          <p className="font-medium text-foreground">{caseData.customer?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Filing Date</p>
                          <p className="font-medium text-foreground">
                            {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Profile Summary */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-foreground">{profile?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-foreground">{profile?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="text-foreground">{profile?.bio || 'No bio provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specialization</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {profile?.specialization || 'General Practice'}
                  </Badge>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Bar Council ID</p>
                  <p className="font-medium text-foreground">{profile?.bar_council_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approval Status</p>
                  <Badge
                    className={
                      profile?.approval_status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : profile?.approval_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {profile?.approval_status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
