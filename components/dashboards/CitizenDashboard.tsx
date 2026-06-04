'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, Users, Plus, Clock, RefreshCw, Send } from 'lucide-react';
import { casesApi, advocatesApi } from '@/lib/api';
import { messagingApi } from '@/lib/messaging-api';
import DashboardHeader from '@/components/DashboardHeader';

export default function CitizenDashboard() {
  const { session, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'cases' | 'advocates' | 'chat'>('cases');
  const [cases, setCases] = useState<any[]>([]);
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState<string | null>(null);

  if (!session.user || session.user.role !== 'customer') {
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

      // Fetch cases and advocates in parallel
      const [casesRes, advocatesRes] = await Promise.all([
        casesApi.listCases(),
        advocatesApi.listAdvocates(),
      ]);

      if (casesRes.data && !casesRes.error) {
        // Handle paginated response
        let allCases: any[] = [];
        if (Array.isArray(casesRes.data)) {
          allCases = casesRes.data;
        } else if (casesRes.data && typeof casesRes.data === 'object' && 'results' in casesRes.data) {
          allCases = (casesRes.data as any).results || [];
        }
        // Backend returns customer as integer ID; session.user.id may be string — compare loosely
        const userCases = allCases.filter((c) => String(c.customer) === String(session.user?.id));
        setCases(userCases);
      }

      if (advocatesRes.data && !advocatesRes.error) {
        // Handle paginated response
        let allAdvocates: any[] = [];
        if (Array.isArray(advocatesRes.data)) {
          allAdvocates = advocatesRes.data;
        } else if (advocatesRes.data && typeof advocatesRes.data === 'object' && 'results' in advocatesRes.data) {
          allAdvocates = (advocatesRes.data as any).results || [];
        }
        // Filter only approved advocates
        const approvedAdvocates = allAdvocates.filter((a) => a.approval_status === 'approved');
        setAdvocates(approvedAdvocates);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'hearing':
      case 'evidence':
      case 'arguments':
        return 'bg-yellow-100 text-yellow-800';
      case 'judgment':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
      case 'appealed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
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
        <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
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

            {cases.length === 0 ? (
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
                {cases.map((caseData) => (
                  <Link key={caseData.id} href={`/dashboard/case/${caseData.id}`}>
                    <Card className="border border-border bg-card hover:shadow-lg transition cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{caseData.title}</CardTitle>
                            <CardDescription>Case #{caseData.id}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(caseData.status)}>
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
                            <p className="text-muted-foreground">Advocate</p>
                            <p className="font-medium text-foreground">
                              {caseData.advocate
                                ? advocates.find((a) => a.id === caseData.advocate)?.name || 'Assigned'
                                : 'Not assigned'}
                            </p>
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
        )}

        {/* Advocates Tab */}
        {activeTab === 'advocates' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Find Expert Advocates</h2>
              <p className="text-sm text-muted-foreground">Browse and connect with qualified advocates</p>
            </div>

            {advocates.length === 0 ? (
              <Card className="border border-border bg-card">
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No advocates available</p>
                  <p className="text-sm text-muted-foreground">Check back later for available advocates</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {advocates.map((advocate) => (
                  <Link
                    key={advocate.id}
                    href={`/dashboard/advocates/${advocate.id}`}
                  >
                    <Card className="border border-border bg-card hover:shadow-lg transition cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{advocate.name}</CardTitle>
                            <CardDescription>{advocate.email}</CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Available</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{advocate.bio || `Experienced ${advocate.specialization || 'Legal'} professional with ${advocate.experience_years || 0} years of practice.`}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Experience</p>
                            <p className="font-medium text-foreground">{advocate.experience_years || 0} years</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium text-foreground">{advocate.phone || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Specialization</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {advocate.specialization || 'General Practice'}
                            </Badge>
                          </div>
                        </div>
                        <div className="border-t border-border pt-4">
                          <Button 
                            className="w-full" 
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              try {
                                setMessageLoading(advocate.id);
                                const response = await messagingApi.startConversation(advocate.id);
                                if (response.data && (response.data as any).id) {
                                  // Redirect to conversation or open messaging modal
                                  window.location.href = `/dashboard/chat?conversation=${(response.data as any).id}`;
                                }
                              } catch (error) {
                                console.error('Failed to start conversation:', error);
                                alert('Failed to start conversation. Please try again.');
                              } finally {
                                setMessageLoading(null);
                              }
                            }}
                            disabled={messageLoading === advocate.id}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
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

            <Link href="/dashboard/customer/ai-chat">
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
