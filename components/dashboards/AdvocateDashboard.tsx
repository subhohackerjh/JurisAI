'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Star, TrendingUp, Clock } from 'lucide-react';
import { mockCases, mockAdvocates } from '@/lib/mock-data';
import DashboardHeader from '@/components/DashboardHeader';

export default function AdvocateDashboard() {
  const { session, logout } = useAuth();

  if (!session.user || session.user.role !== 'advocate') {
    return null;
  }

  const advocate = mockAdvocates.find((a) => a.id === session.user?.id);
  const assignedCases = mockCases.filter((c) => c.advocateId === session.user?.id);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {advocate?.name}</h1>
          <p className="text-muted-foreground">Manage your cases and client interactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Cases', value: assignedCases.length, icon: FileText },
            { label: 'Experience', value: `${advocate?.experience}y`, icon: TrendingUp },
            { label: 'Rating', value: `${advocate?.rating}⭐`, icon: Star },
            { label: 'Hourly Rate', value: `₹${advocate?.hourlyRate}`, icon: Clock },
          ].map((stat, idx) => (
            <Card key={idx} className="border border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary opacity-20" />
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

          {assignedCases.length === 0 ? (
            <Card className="border border-border bg-card">
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No cases assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignedCases.map((caseData) => (
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
                              : 'bg-blue-100 text-blue-800'
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
                          <p className="text-muted-foreground">Client</p>
                          <p className="font-medium text-foreground">
                            {mockCases.find((c) => c.id === caseData.id)?.citizenId}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Documents</p>
                          <p className="font-medium text-foreground">{caseData.documents.length}</p>
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
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="text-foreground">{advocate?.bio}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {advocate?.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium text-foreground">{advocate?.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      advocate?.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {advocate?.isAvailable ? 'Available' : 'Unavailable'}
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
