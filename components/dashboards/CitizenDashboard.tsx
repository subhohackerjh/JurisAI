'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, Users, LogOut, Plus, Clock } from 'lucide-react';
import { mockCases, mockAdvocates } from '@/lib/mock-data';
import DashboardHeader from '@/components/DashboardHeader';

export default function CitizenDashboard() {
  const { session, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'cases' | 'advocates' | 'chat'>('cases');

  if (!session.user || session.user.role !== 'citizen') {
    return null;
  }

  const userCases = mockCases.filter((c) => c.citizenId === session.user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 line-clamp-2">
            Welcome, {session.user.name.split(' ')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your legal cases and find advocates</p>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="flex gap-1 sm:gap-2 mb-6 border-b border-border overflow-x-auto">
          {[
            { id: 'cases', label: 'My Cases', icon: FileText },
            { id: 'advocates', label: 'Advocates', icon: Users },
            { id: 'chat', label: 'Legal AI', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Your Cases</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Track and manage your cases</p>
              </div>
              <Link href="/dashboard/file-case" className="w-full sm:w-auto">
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  <span>File New Case</span>
                </Button>
              </Link>
            </div>

            {userCases.length === 0 ? (
              <Card className="border border-border bg-card">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No cases filed yet</p>
                  <Link href="/dashboard/file-case">
                    <Button variant="outline">File Your First Case</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {userCases.map((caseData) => (
                  <Link key={caseData.id} href={`/dashboard/case/${caseData.id}`}>
                    <Card className="border border-border bg-card hover:shadow-lg transition cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{caseData.title}</CardTitle>
                            <CardDescription>Case #{caseData.caseNumber}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(caseData.status)}>
                            {caseData.status.replace('_', ' ')}
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
                            <p className="text-muted-foreground">Advocate</p>
                            <p className="font-medium text-foreground">
                              {caseData.advocateId
                                ? mockAdvocates.find((a) => a.id === caseData.advocateId)?.name
                                : 'Not assigned'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Budget Used</p>
                            <p className="font-medium text-foreground">
                              ₹{caseData.spent} / ₹{caseData.budget}
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
        )}

        {/* Advocates Tab */}
        {activeTab === 'advocates' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Find Expert Advocates</h2>
              <p className="text-sm text-muted-foreground">Browse and connect with qualified advocates</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {mockAdvocates.map((advocate) => (
                <Link
                  key={advocate.id}
                  href={`/dashboard/advocates/${advocate.id}`}
                >
                  <Card className="border border-border bg-card hover:shadow-lg transition cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{advocate.name}</CardTitle>
                          <CardDescription>{advocate.licenseNumber}</CardDescription>
                        </div>
                        {advocate.isAvailable && (
                          <Badge className="bg-green-100 text-green-800">Available</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{advocate.bio}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Experience</p>
                          <p className="font-medium text-foreground">{advocate.experience} years</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <p className="font-medium text-foreground">
                            ⭐ {advocate.rating} ({advocate.reviewCount})
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {advocate.specializations.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <p className="font-semibold text-foreground">
                          ₹{advocate.hourlyRate}/hour
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Legal AI Assistant</h2>
              <p className="text-sm text-muted-foreground">
                Ask questions about laws, cases, and legal procedures
              </p>
            </div>

            <Link href="/dashboard/chat">
              <Card className="border border-border bg-card hover:shadow-lg transition cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Chat with AI Legal Assistant</h3>
                      <p className="text-sm text-muted-foreground">
                        Get instant answers powered by legal knowledge base
                      </p>
                    </div>
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
