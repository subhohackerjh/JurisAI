'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Building2, TrendingUp, MessageSquare } from 'lucide-react';
import { mockCases, mockAdvocates, mockPoliceStations, mockCitizens, getFeedback, updateFeedbackStatus } from '@/lib/mock-data';
import DashboardHeader from '@/components/DashboardHeader';
import { useState } from 'react';

export default function AdminDashboard() {
  const { session, logout } = useAuth();
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [feedbackResponse, setFeedbackResponse] = useState<Record<string, string>>({});

  if (!session.user || session.user.role !== 'admin') {
    return null;
  }

  const allFeedback = getFeedback();
  const newFeedbackCount = allFeedback.filter(f => f.status === 'new').length;

  const stats = [
    { label: 'Total Advocates', value: mockAdvocates.length, icon: Users },
    { label: 'Total Cases', value: mockCases.length, icon: FileText },
    { label: 'Police Stations', value: mockPoliceStations.length, icon: Building2 },
    { label: 'Pending Feedback', value: newFeedbackCount, icon: MessageSquare },
  ];

  const handleResolveFeedback = (feedbackId: string) => {
    const response = feedbackResponse[feedbackId] || 'Thank you for your feedback!';
    updateFeedbackStatus(feedbackId, 'resolved', response);
    setFeedbackResponse((prev) => {
      const updated = { ...prev };
      delete updated[feedbackId];
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Platform overview and management tools</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border border-border bg-card hover:shadow-md transition">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          ))}
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
                {['open', 'in_progress', 'closed', 'pending'].map((status) => {
                  const count = mockCases.filter((c) => c.status === status).length;
                  const percentage = ((count / mockCases.length) * 100).toFixed(0);
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
                <p className="text-2xl font-bold text-foreground">{mockAdvocates.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockAdvocates.filter((a) => a.isAvailable).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {(
                    mockAdvocates.reduce((sum, a) => sum + a.rating, 0) /
                    mockAdvocates.length
                  ).toFixed(1)}
                  ⭐
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
            {mockAdvocates.map((advocate) => (
              <Card key={advocate.id} className="border border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{advocate.name}</h3>
                      <p className="text-sm text-muted-foreground">{advocate.licenseNumber}</p>
                    </div>
                    <Badge
                      className={
                        advocate.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {advocate.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-medium text-foreground">{advocate.experience} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-medium text-foreground">
                        {advocate.rating}⭐ ({advocate.reviewCount})
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium text-foreground">₹{advocate.hourlyRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cases</p>
                      <p className="font-medium text-foreground">
                        {mockCases.filter((c) => c.advocateId === advocate.id).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Police Stations */}
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Police Stations</h2>
            <p className="text-sm text-muted-foreground">All registered stations</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {mockPoliceStations.map((station) => (
              <Card key={station.id} className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <CardDescription>{station.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{station.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Officers</p>
                      <p className="font-medium text-foreground">{station.officerCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cases</p>
                      <p className="font-medium text-foreground">{station.caseCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground text-xs">{station.email}</p>
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
            {allFeedback.length === 0 ? (
              <Card className="border border-border bg-card p-6 text-center">
                <p className="text-muted-foreground">No feedback received yet</p>
              </Card>
            ) : (
              allFeedback.map((feedback) => (
                <Card key={feedback.id} className="border border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{feedback.subject}</h3>
                          <Badge
                            className={
                              feedback.status === 'new'
                                ? 'bg-blue-100 text-blue-800'
                                : feedback.status === 'reviewed'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }
                          >
                            {feedback.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          From: {feedback.userName} ({feedback.userRole})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rating: {'⭐'.repeat(feedback.rating)} ({feedback.rating}/5)
                        </p>
                      </div>
                      <Badge variant="outline">{feedback.category}</Badge>
                    </div>

                    {expandedFeedback === feedback.id ? (
                      <div className="space-y-4 mt-4">
                        <div className="bg-secondary p-4 rounded-lg">
                          <p className="text-sm text-foreground">{feedback.message}</p>
                        </div>

                        {feedback.status !== 'resolved' && (
                          <div className="space-y-3">
                            <textarea
                              placeholder="Write your response to this feedback..."
                              value={feedbackResponse[feedback.id] || ''}
                              onChange={(e) =>
                                setFeedbackResponse((prev) => ({
                                  ...prev,
                                  [feedback.id]: e.target.value,
                                }))
                              }
                              className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleResolveFeedback(feedback.id)}
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

                        {feedback.response && (
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold mb-1">Your Response</p>
                            <p className="text-sm text-green-900">{feedback.response}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => setExpandedFeedback(feedback.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          {feedback.status === 'resolved' ? 'View' : 'Respond'}
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
