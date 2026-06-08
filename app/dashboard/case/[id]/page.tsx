'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { casesApi } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import {
  FileText, ArrowLeft, Calendar, Clock, Upload,
  Trash2, Eye, CheckCircle, AlertCircle, Gavel, Star
} from 'lucide-react';

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { session, logout } = useAuth();
  const user = session?.user;
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'updates'>('overview');

  // Document upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCase = async () => {
    try {
      const response = await casesApi.getCaseDetail(id as string);
      if (response.data) setCaseData(response.data);
      else setError(response.error || 'Case not found');
    } catch {
      setError('Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) loadCase(); }, [id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;
    setIsUploading(true);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('document_type', uploadType);
      if (uploadDescription) formData.append('description', uploadDescription);

      const res = await casesApi.uploadDocument(id as string, formData);
      if (res.error) {
        setUploadMsg({ type: 'error', text: res.error });
      } else {
        setUploadMsg({ type: 'success', text: 'Document uploaded successfully!' });
        setUploadFile(null);
        setUploadTitle('');
        setUploadType('other');
        setUploadDescription('');
        await loadCase(); // refresh
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Delete this document?')) return;
    const res = await casesApi.deleteDocument(id as string, documentId);
    if (!res.error) await loadCase();
  };

  if (!session.user) return null;

  if (loading) return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading case details...</p>
      </div>
    </div>
  );

  if (error || !caseData) return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{error || 'Case not found'}</p>
        <Link href="/dashboard"><Button>Back to Dashboard</Button></Link>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      filed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      hearing: 'bg-purple-100 text-purple-800',
      evidence: 'bg-orange-100 text-orange-800',
      arguments: 'bg-indigo-100 text-indigo-800',
      judgment: 'bg-pink-100 text-pink-800',
      closed: 'bg-green-100 text-green-800',
      dismissed: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: `Documents (${caseData.documents?.length || 0})` },
    { id: 'updates', label: `Updates (${caseData.updates?.length || 0})` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto">

        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>

        {/* Case Header */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl line-clamp-2">{caseData.title}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {caseData.cnr_number ? `CNR: ${caseData.cnr_number}` : `ID: ${caseData.id}`}
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(caseData.status)} flex-shrink-0`}>
                {caseData.status_display || caseData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground mb-4">{caseData.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium">{caseData.case_type_display || caseData.case_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Filed</p>
                <p className="font-medium">{caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Updated</p>
                <p className="font-medium">{new Date(caseData.updated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Advocate</p>
                <p className="font-medium">{caseData.advocate?.name || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === t.id
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Advocate info */}
            {caseData.advocate && (
              <Card>
                <CardHeader><CardTitle className="text-base">Assigned Advocate</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{caseData.advocate.name}</p></div>
                  <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{caseData.advocate.email}</p></div>
                  {caseData.advocate.phone && <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{caseData.advocate.phone}</p></div>}
                  {caseData.advocate.bar_council_id && <div><p className="text-muted-foreground text-xs">Bar Council ID</p><p className="font-medium">{caseData.advocate.bar_council_id}</p></div>}
                  {caseData.advocate_fee && <div><p className="text-muted-foreground text-xs">Agreed Fee</p><p className="font-medium">₹{Number(caseData.advocate_fee).toLocaleString()}</p></div>}
                </CardContent>
                {/* Rate advocate button — show for customer on closed cases */}
                {user?.role === 'customer' && ['closed', 'dismissed'].includes(caseData.status) && (
                  <CardContent className="pt-0">
                    <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => router.push(`/dashboard/rate-advocate?advocate_id=${caseData.advocate.id}&case_id=${caseData.id}`)}>
                      <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-400 text-amber-400" /> Rate This Advocate
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Court info */}
            {caseData.court_name && (
              <Card>
                <CardHeader><CardTitle className="text-base">Court Details</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div><p className="text-muted-foreground text-xs">Court</p><p className="font-medium">{caseData.court_name}</p></div>
                  {caseData.court_address && <div><p className="text-muted-foreground text-xs">Address</p><p className="font-medium">{caseData.court_address}</p></div>}
                  {caseData.judge_name && <div><p className="text-muted-foreground text-xs">Judge</p><p className="font-medium">{caseData.judge_name}</p></div>}
                  {caseData.next_hearing_date && (
                    <div className="flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-primary" />
                      <div><p className="text-muted-foreground text-xs">Next Hearing</p><p className="font-medium">{new Date(caseData.next_hearing_date).toLocaleString()}</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hearings */}
            {caseData.hearings && caseData.hearings.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Hearing Schedule</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {caseData.hearings.map((h: any) => (
                    <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{h.hearing_type?.replace('_', ' ').toUpperCase()}</p>
                          <Badge className={h.is_completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} >
                            {h.is_completed ? 'Done' : 'Upcoming'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(h.hearing_date).toLocaleString()}
                          {h.court_room && ` · Room ${h.court_room}`}
                        </p>
                        <p className="text-xs mt-1">{h.purpose}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Documents Tab ── */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {/* Upload form */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Document</CardTitle></CardHeader>
              <CardContent>
                {uploadMsg && (
                  <div className={`mb-4 p-3 rounded-lg border flex gap-2 text-sm ${
                    uploadMsg.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-destructive/10 border-destructive/30'
                  }`}>
                    {uploadMsg.type === 'success'
                      ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                    {uploadMsg.text}
                  </div>
                )}
                <form onSubmit={handleUpload} className="space-y-3">
                  <div>
                    <Label>File *</Label>
                    <Input
                      type="file"
                      className="mt-1"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <p className="text-xs text-muted-foreground mt-1">PDF, Word, or image files</p>
                  </div>
                  <div>
                    <Label>Document Title *</Label>
                    <Input
                      className="mt-1"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g., FIR Copy, Affidavit"
                    />
                  </div>
                  <div>
                    <Label>Document Type</Label>
                    <Select value={uploadType} onValueChange={setUploadType}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petition">Petition</SelectItem>
                        <SelectItem value="affidavit">Affidavit</SelectItem>
                        <SelectItem value="evidence">Evidence</SelectItem>
                        <SelectItem value="order">Court Order</SelectItem>
                        <SelectItem value="judgment">Judgment</SelectItem>
                        <SelectItem value="agreement">Agreement</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description (Optional)</Label>
                    <Input
                      className="mt-1"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Brief description..."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!uploadFile || !uploadTitle.trim() || isUploading}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Documents list */}
            <Card>
              <CardHeader><CardTitle className="text-base">Uploaded Documents</CardTitle></CardHeader>
              <CardContent>
                {(!caseData.documents || caseData.documents.length === 0) ? (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {caseData.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type} · {new Date(doc.created_at).toLocaleDateString()}
                            {doc.file_size && ` · ${(doc.file_size / 1024).toFixed(1)} KB`}
                          </p>
                          {doc.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.description}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {doc.file_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-3 h-3 mr-1" /> View
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Updates Tab ── */}
        {activeTab === 'updates' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case Updates</CardTitle>
              <CardDescription>Timeline of all events on this case</CardDescription>
            </CardHeader>
            <CardContent>
              {(!caseData.updates || caseData.updates.length === 0) ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No updates yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {caseData.updates.map((update: any, idx: number) => (
                    <div key={update.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        {idx < caseData.updates.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 pb-4 min-w-0">
                        <p className="font-semibold text-sm">{update.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{update.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(update.created_at).toLocaleString()} · {update.created_by_name || 'System'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
