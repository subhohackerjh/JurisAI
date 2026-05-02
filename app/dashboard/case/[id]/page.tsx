'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { casesApi, advocatesApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { FileText, Calendar, DollarSign, User, MapPin, ArrowLeft } from 'lucide-react';

export default function CaseDetailPage() {
  const { id } = useParams();
  const { session, logout } = useAuth();

  if (!session.user) {
    return null;
  }

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        const response = await casesApi.getCaseDetail(id as string);
        if (response.data) {
          setCaseData(response.data);
        } else {
          setError('Case not found');
        }
      } catch (err) {
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCaseData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-muted-foreground">{error || 'Case not found'}</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const advocate = caseData.advocate;
  const station = caseData.court_name;

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

      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4 sm:mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back</span>
          </Button>
        </Link>

        {/* Case Header */}
        <Card className="border border-border bg-card mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-3xl line-clamp-2">{caseData.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Case #{caseData.caseNumber}</CardDescription>
              </div>
              <Badge className={`${getStatusColor(caseData.status)} flex-shrink-0 text-xs sm:text-sm`}>
                {caseData.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-6">{caseData.description}</p>

            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium text-foreground capitalize">{caseData.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filed Date</p>
                <p className="font-medium text-foreground">{caseData.filedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium text-foreground">{caseData.updatedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium text-foreground">
                  ₹{caseData.spent} / ₹{caseData.budget}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advocate & Station Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {advocate && (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Assigned Advocate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{advocate.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License</p>
                  <p className="font-medium text-foreground">{advocate.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium text-foreground">
                    ⭐ {advocate.rating} ({advocate.reviewCount} reviews)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="font-medium text-foreground">₹{advocate.hourlyRate}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {station && (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Police Station</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{station.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{station.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{station.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground text-sm">{station.email}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <Card className="border border-border bg-card mb-6">
          <CardHeader>
            <CardTitle>Case Timeline</CardTitle>
            <CardDescription>Important events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseData.timeline.map((event, idx) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    {idx < caseData.timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="border border-border bg-card mb-6">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Associated case files</CardDescription>
          </CardHeader>
          <CardContent>
            {caseData.documents.length === 0 ? (
              <p className="text-muted-foreground">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {caseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition"
                  >
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded on {doc.uploadedDate}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle>Case Notes</CardTitle>
            <CardDescription>Updates and communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseData.notes.length === 0 ? (
                <p className="text-muted-foreground">No notes yet</p>
              ) : (
                caseData.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border border-border bg-secondary/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-foreground">{note.authorName}</p>
                        <p className="text-xs text-muted-foreground">{note.createdAt}</p>
                      </div>
                      {note.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
