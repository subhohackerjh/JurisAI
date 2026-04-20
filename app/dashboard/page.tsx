'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CitizenDashboard from '@/components/dashboards/CitizenDashboard';
import AdvocateDashboard from '@/components/dashboards/AdvocateDashboard';
import PoliceOfficerDashboard from '@/components/dashboards/PoliceOfficerDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

export default function DashboardPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session.isAuthenticated) {
      router.push('/login');
    }
  }, [session.isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session.user) {
    return null;
  }

  switch (session.user.role) {
    case 'customer':
      return <CitizenDashboard />;
    case 'advocate':
      return <AdvocateDashboard />;
    case 'police_officer':
      return <PoliceOfficerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return null;
  }
}
