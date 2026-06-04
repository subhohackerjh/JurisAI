'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCases, useDashboardStats } from '@/hooks/useCases';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Calendar, 
  FileText, 
  UserCheck,
  AlertCircle,
  Eye
} from 'lucide-react';

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const { cases, isLoading: casesLoading } = useCases();
  const { stats, isLoading: statsLoading } = useDashboardStats();

  // c.advocate is an integer ID in list serializer; user.id may be a string
  const myCases = cases.filter(c => String(c.advocate) === String(user?.id));

  const handleViewCase = (caseId: string) => {
    router.push(`/dashboard/advocate/cases/${caseId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Advocate Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your cases</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_cases || 0}</p>
                <p className="text-sm text-muted-foreground">Total Cases</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.active_cases || 0}</p>
                <p className="text-sm text-muted-foreground">Active Cases</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.completed_cases || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.cases_handled || 0}</p>
                <p className="text-sm text-muted-foreground">Cases Handled</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Cases */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">My Cases</h2>
          {casesLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading cases...</p>
            </div>
          ) : myCases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cases assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myCases.map((caseItem) => (
                <Card key={caseItem.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{caseItem.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {caseItem.description}
                      </p>
                    </div>
                    <Badge className={
                      caseItem.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : caseItem.status === 'hearing'
                        ? 'bg-blue-100 text-blue-800'
                        : caseItem.status === 'closed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {caseItem.status_display || caseItem.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{caseItem.case_type_display || caseItem.case_type}</span>
                    </div>
                    {caseItem.court_name && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{caseItem.court_name}</span>
                      </div>
                    )}
                    {caseItem.next_hearing_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(caseItem.next_hearing_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{caseItem.documents_count || 0} docs</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewCase(caseItem.id)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Case Details
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
