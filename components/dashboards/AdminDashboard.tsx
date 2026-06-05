'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Building2, MessageSquare, RefreshCw } from 'lucide-react';
import { advocatesApi, casesApi, feedbackApi, profileApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { useState, useEffect } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { session, logout } = useAuth();
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [feedbackResponse, setFeedbackResponse] = useState<Record<string, string>>({});
  
  const adminRouter = useNextRouter();
  // Data states
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!session.user || session.user.role !== 'admin') {
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

      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Fetch all data in parallel
      const [advocatesRes, pendingAdvocatesRes, casesRes, feedbackRes] = await Promise.all([
        advocatesApi.listAdvocates(),
        advocatesApi.listPendingAdvocates(),
        casesApi.listCases(),
        feedbackApi.listFeedback(),
      ]);

      // Combine approved and pending advocates
      let allAdvocates: any[] = [];
      
      if (advocatesRes.data && !advocatesRes.error) {
        // Handle approved advocates (paginated response)
        let approvedAdvocates: any[] = [];
        if (Array.isArray(advocatesRes.data)) {
          approvedAdvocates = advocatesRes.data;
        } else if (advocatesRes.data && typeof advocatesRes.data === 'object' && 'results' in advocatesRes.data) {
          approvedAdvocates = (advocatesRes.data as any).results || [];
        }
        allAdvocates = [...allAdvocates, ...approvedAdvocates];
      }
      
      if (pendingAdvocatesRes.data && !pendingAdvocatesRes.error) {
        // Handle pending advocates (direct array response)
        let pendingAdvocates: any[] = [];
        if (Array.isArray(pendingAdvocatesRes.data)) {
          pendingAdvocates = pendingAdvocatesRes.data;
        } else if (pendingAdvocatesRes.data && typeof pendingAdvocatesRes.data === 'object' && 'results' in pendingAdvocatesRes.data) {
          pendingAdvocates = (pendingAdvocatesRes.data as any).results || [];
        }
        allAdvocates = [...allAdvocates, ...pendingAdvocates];
      }
      
      setAdvocates(allAdvocates);

      let casesData: any[] = [];
      if (casesRes.data && !casesRes.error) {
        const d = casesRes.data as any;
        casesData = Array.isArray(d) ? d : (d.results ?? []);
        setCases(casesData);
      }

      let feedbackData: any[] = [];
      if (feedbackRes.data && !feedbackRes.error) {
        const d = feedbackRes.data as any;
        feedbackData = Array.isArray(d) ? d : (d.results ?? []);
        setFeedback(feedbackData);
      }

      // Calculate stats from LOCAL variables (not stale state)
      const pendingCount = allAdvocates.filter(a => a.approval_status === 'pending').length;
      const newFeedbackCount = feedbackData.filter(f => f.status === 'new').length;

      setStats([
        { label: 'Total Advocates', value: allAdvocates.length, icon: Users },
        { label: 'Total Cases', value: casesData.length, icon: FileText },
        { label: 'Pending Approvals', value: pendingCount, icon: Building2 },
        { label: 'New Feedback', value: newFeedbackCount, icon: MessageSquare },
      ]);
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('401')) {
        setError('Authentication expired. Please log in again.');
      } else if (errorMessage.includes('403')) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFeedback = async (feedbackId: string) => {
    try {
      const response = feedbackResponse[feedbackId] || 'Thank you for your feedback!';
      
      // Update feedback status via API
      await feedbackApi.updateFeedback(feedbackId, { status: 'resolved', resolution: response });
      
      // Refresh feedback list
      const feedbackRes = await feedbackApi.listFeedback();
      if (feedbackRes.data && !feedbackRes.error) {
        const d = feedbackRes.data as any;
        setFeedback(Array.isArray(d) ? d : (d.results ?? []));
      }
      
      setFeedbackResponse((prev) => {
        const updated = { ...prev };
        delete updated[feedbackId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to resolve feedback:', err);
      setError('Failed to resolve feedback');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
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
      <div className="min-h-screen">
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
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 shadow-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">Admin Portal</span>
          </div>
          <h1 className="legal-page-title">Admin Dashboard</h1>
          <p className="legal-page-subtitle mt-2">Platform overview and management tools</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-indigo-600 opacity-30" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <Button
            onClick={() => adminRouter.push('/dashboard/admin/approvals')}
            className="w-full h-auto py-4 sm:py-6 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Users className="w-6 h-6" />
            <span className="font-semibold">Review Advocate Approvals</span>
            <span className="text-xs opacity-80">Pending registrations</span>
          </Button>
          <Button
            onClick={() => adminRouter.push('/dashboard/feedback')}
            className="w-full h-auto py-4 sm:py-6 flex flex-col items-center gap-2"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="font-semibold">Manage Feedback</span>
            <span className="text-xs opacity-80">User feedback & ratings</span>
          </Button>
        </div>

        {/* Case Status Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle>Case Status Distribution</CardTitle>
              <CardDescription>Overview of all cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['draft', 'filed', 'pending', 'hearing', 'closed', 'dismissed'].map((status) => {
                  const count = cases.filter((c) => c.status === status).length;
                  const percentage = cases.length > 0 ? ((count / cases.length) * 100).toFixed(0) : '0';
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle>Advocate Statistics</CardTitle>
              <CardDescription>Active advocates and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Advocates</p>
                <p className="text-2xl font-bold text-foreground">{advocates.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-foreground">
                  {advocates.filter((a) => a.approval_status === 'approved').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-foreground">
                  {advocates.filter((a) => a.approval_status === 'pending').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advocates List */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Advocates</h2>
            <p className="text-sm text-muted-foreground">All registered advocates</p>
          </div>

          <div className="grid gap-4">
            {advocates.map((advocate) => (
              <Card key={advocate.id} className="border border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{advocate.name}</h3>
                      <p className="text-sm text-muted-foreground">{advocate.email}</p>
                    </div>
                    <Badge
                      className={
                        advocate.approval_status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : advocate.approval_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {advocate.approval_status || 'pending'}
                    </Badge>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-medium text-foreground">{advocate.experience_years || 0} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Specialization</p>
                      <p className="font-medium text-foreground">{advocate.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{advocate.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cases</p>
                      <p className="font-medium text-foreground">
                        {cases.filter((c) => String(c.advocate) === String(advocate.id)).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feedback Management */}
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Client Feedback</h2>
            <p className="text-sm text-muted-foreground">Manage feedback and user suggestions</p>
          </div>

          <div className="space-y-4">
            {feedback.length === 0 ? (
              <Card className="border border-border bg-card p-6 text-center">
                <p className="text-muted-foreground">No feedback received yet</p>
              </Card>
            ) : (
              feedback.map((feedbackItem) => (
                <Card key={feedbackItem.id} className="border border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{feedbackItem.subject}</h3>
                          <Badge
                            className={
                              feedbackItem.status === 'new'
                                ? 'bg-blue-100 text-blue-800'
                                : feedbackItem.status === 'under_review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : feedbackItem.status === 'in_progress'
                                ? 'bg-orange-100 text-orange-800'
                                : feedbackItem.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {feedbackItem.status?.replace('_', ' ') || 'new'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          From: {feedbackItem.user?.name || 'Anonymous'} ({feedbackItem.user?.role || 'user'})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {feedbackItem.feedback_type?.replace('_', ' ') || 'general'} | Priority: {feedbackItem.priority || 'medium'}
                        </p>
                      </div>
                      <Badge variant="outline">{feedbackItem.feedback_type?.replace('_', ' ') || 'General'}</Badge>
                    </div>

                    {expandedFeedback === feedbackItem.id ? (
                      <div className="space-y-4 mt-4">
                        <div className="bg-secondary p-4 rounded-lg">
                          <p className="text-sm text-foreground">{feedbackItem.message}</p>
                        </div>

                        {feedbackItem.status !== 'resolved' && feedbackItem.status !== 'closed' && (
                          <div className="space-y-3">
                            <textarea
                              placeholder="Write your response to this feedback..."
                              value={feedbackResponse[feedbackItem.id] || ''}
                              onChange={(e) =>
                                setFeedbackResponse((prev) => ({
                                  ...prev,
                                  [feedbackItem.id]: e.target.value,
                                }))
                              }
                              className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleResolveFeedback(feedbackItem.id)}
                                className="flex-1 bg-primary hover:bg-primary/90"
                              >
                                Mark as Resolved
                              </Button>
                              <Button
                                onClick={() => setExpandedFeedback(null)}
                                variant="outline"
                                className="flex-1"
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        )}

                        {feedbackItem.resolution && (
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold mb-1">Your Response</p>
                            <p className="text-sm text-green-900">{feedbackItem.resolution}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => setExpandedFeedback(feedbackItem.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          {feedbackItem.status === 'resolved' ? 'View' : 'Respond'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
