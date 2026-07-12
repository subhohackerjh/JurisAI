'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CitizenDashboard from '@/components/dashboards/CitizenDashboard';
import AdvocateDashboard from '@/components/dashboards/AdvocateDashboard';
import PoliceOfficerDashboard from '@/components/dashboards/PoliceOfficerDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

export default function DashboardPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[Dashboard] Session state:', {
      isLoading,
      isAuthenticated: session.isAuthenticated,
      user: session.user?.email,
      role: session.user?.role
    });
    
    if (!isLoading && !session.isAuthenticated) {
      console.log('[Dashboard] Session not authenticated, redirecting to login');
      router.push('/login');
    } else if (!isLoading && session.isAuthenticated) {
      console.log('[Dashboard] Session authenticated, staying on dashboard');
    }
  }, [session.isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
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
    case 'police':
      return <PoliceOfficerDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return null;
  }
}
