'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { casesApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { FileText, Calendar, DollarSign, User, ArrowLeft, Clock, Gavel } from 'lucide-react';

export default function CaseDetailPage() {
  const { id } = useParams();
  const { session, logout } = useAuth();
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
          setError(response.error || 'Case not found');
        }
      } catch {
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCaseData();
  }, [id]);

  if (!session.user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} onLogout={logout} />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">{error || 'Case not found'}</p>
          <Link href="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      filed: 'bg-blue-100 text-blue-800',
      hearing: 'bg-purple-100 text-purple-800',
      closed: 'bg-green-100 text-green-800',
      dismissed: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
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
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-3xl line-clamp-2">{caseData.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {caseData.cnr_number ? `CNR: ${caseData.cnr_number}` : `Case ID: ${caseData.id}`}
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(caseData.status)} flex-shrink-0 text-xs sm:text-sm`}>
                {caseData.status_display || caseData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-6 text-sm">{caseData.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{caseData.case_type_display || caseData.case_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Filed Date</p>
                <p className="font-medium">
                  {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {caseData.updated_at ? new Date(caseData.updated_at).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Cost</p>
                <p className="font-medium">
                  {caseData.total_cost ? `₹${Number(caseData.total_cost).toLocaleString()}` : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advocate & Court Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {caseData.advocate && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Assigned Advocate</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><p className="text-muted-foreground">Name</p><p className="font-medium">{caseData.advocate.name}</p></div>
                {caseData.advocate.bar_council_id && (
                  <div><p className="text-muted-foreground">Bar Council ID</p><p className="font-medium">{caseData.advocate.bar_council_id}</p></div>
                )}
                {caseData.advocate.rating && (
                  <div><p className="text-muted-foreground">Rating</p><p className="font-medium">⭐ {caseData.advocate.rating}</p></div>
                )}
                {caseData.advocate.phone && (
                  <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{caseData.advocate.phone}</p></div>
                )}
                {caseData.advocate_fee && (
                  <div><p className="text-muted-foreground">Advocate Fee</p><p className="font-medium">₹{Number(caseData.advocate_fee).toLocaleString()}</p></div>
                )}
              </CardContent>
            </Card>
          )}

          {caseData.court_name && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Court Details</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><p className="text-muted-foreground">Court</p><p className="font-medium">{caseData.court_name}</p></div>
                {caseData.court_address && (
                  <div><p className="text-muted-foreground">Address</p><p className="font-medium">{caseData.court_address}</p></div>
                )}
                {caseData.judge_name && (
                  <div><p className="text-muted-foreground">Judge</p><p className="font-medium">{caseData.judge_name}</p></div>
                )}
                {caseData.next_hearing_date && (
                  <div><p className="text-muted-foreground">Next Hearing</p>
                    <p className="font-medium">{new Date(caseData.next_hearing_date).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Case Updates / Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Case Updates</CardTitle>
            <CardDescription>Timeline of important events</CardDescription>
          </CardHeader>
          <CardContent>
            {(!caseData.updates || caseData.updates.length === 0) ? (
              <p className="text-muted-foreground text-sm">No updates yet.</p>
            ) : (
              <div className="space-y-4">
                {caseData.updates.map((update: any, idx: number) => (
                  <div key={update.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      {idx < caseData.updates.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-semibold text-foreground">{update.title}</h4>
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(update.created_at).toLocaleDateString()} — {update.created_by_name || 'Unknown'}
                        </p>
                        {!update.is_customer_visible && (
                          <Badge variant="secondary" className="text-xs">Internal</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Associated case files</CardDescription>
          </CardHeader>
          <CardContent>
            {(!caseData.documents || caseData.documents.length === 0) ? (
              <p className="text-muted-foreground text-sm">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {caseData.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 transition">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.document_type} · Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {doc.file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
