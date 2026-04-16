'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Building2, AlertCircle } from 'lucide-react';
import { mockCases, mockPoliceStations, mockPoliceOfficers } from '@/lib/mock-data';
import DashboardHeader from '@/components/DashboardHeader';

export default function PoliceOfficerDashboard() {
  const { session, logout } = useAuth();

  if (!session.user || session.user.role !== 'police_officer') {
    return null;
  }

  const officer = mockPoliceOfficers.find((p) => p.id === session.user?.id);
  const station = mockPoliceStations.find((s) => s.id === officer?.station);
  const stationCases = mockCases.filter((c) => c.stationId === officer?.station);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Welcome, {officer?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Managing cases at {station?.name}</p>
        </div>

        {/* Station Info Card */}
        <Card className="border border-border bg-card mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">{station?.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{station?.location}</CardDescription>
              </div>
              <Building2 className="h-6 w-6 text-primary opacity-20 flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Phone</p>
                <p className="font-semibold text-foreground mt-0.5">{station?.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Officers</p>
                <p className="font-semibold text-foreground mt-0.5">{station?.officerCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Active Cases</p>
                <p className="font-semibold text-foreground mt-0.5">{stationCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="font-semibold text-foreground mt-0.5">{officer?.badgeNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Department</p>
                <p className="font-semibold text-foreground mt-0.5">{officer?.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground text-sm">{officer?.email}</p>
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

          {stationCases.length === 0 ? (
            <Card className="border border-border bg-card">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No cases at this station</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {stationCases.map((caseData) => (
                <Link key={caseData.id} href={`/dashboard/case/${caseData.id}`}>
                  <Card className="border border-border bg-card hover:shadow-lg transition cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{caseData.title}</CardTitle>
                          <CardDescription>Case #{caseData.caseNumber}</CardDescription>
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
                          {caseData.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium text-foreground">{caseData.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Filed Date</p>
                          <p className="font-medium text-foreground">{caseData.filedDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assigned Advocate</p>
                          <p className="font-medium text-foreground">
                            {caseData.advocateId ? 'Assigned' : 'Pending'}
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
