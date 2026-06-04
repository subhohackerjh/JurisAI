'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { casesApi, profileApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { useState, useEffect } from 'react';

export default function PoliceOfficerDashboard() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!session.user || session.user.role !== 'police') {
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
        // Backend returns ALL cases for police role — show them all
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
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
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
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
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
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Welcome, {profile?.name?.split(' ')[0] || 'Officer'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Managing cases at {profile?.station || 'Your Station'}
          </p>
        </div>

        {/* Officer Info Card */}
        <Card className="border border-border bg-card mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Your Details</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Badge and assignment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Badge Number</p>
                <p className="font-semibold text-foreground mt-0.5">{profile?.badge_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Station</p>
                <p className="font-semibold text-foreground mt-0.5">{profile?.station || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground text-sm">{profile?.email || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Station Stats */}
        <Card className="border border-border bg-card mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Station Overview</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {profile?.station || 'Station'} Statistics
                </CardDescription>
              </div>
              <Building2 className="h-6 w-6 text-primary opacity-20 flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Active Cases</p>
                <p className="font-semibold text-foreground mt-0.5">{cases.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Pending Cases</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {cases.filter((c) => c.status === 'pending').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Closed Cases</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {cases.filter((c) => c.status === 'closed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Station Cases</h2>
            <p className="text-sm text-muted-foreground">Cases filed at your station</p>
          </div>

          {cases.length === 0 ? (
            <Card className="border border-border bg-card">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No cases at this station</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {cases.map((caseData) => (
                <Link key={caseData.id} href={`/dashboard/case/${caseData.id}`}>
                  <Card className="border border-border bg-card hover:shadow-lg transition cursor-pointer">
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
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
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
                          <p className="text-muted-foreground">Filing Date</p>
                          <p className="font-medium text-foreground">
                            {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assigned Advocate</p>
                          <p className="font-medium text-foreground">
                            {caseData.advocate ? 'Assigned' : 'Pending'}
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
      </main>
    </div>
  );
}
