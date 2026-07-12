'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMyApplications } from '@/hooks/useInternships';
import { messagingApi } from '@/lib/messaging-api';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Download, MessageSquare, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function InternshipApplicationDetail() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { applications, isLoading, updateStatus, uploadOfferLetter } = useMyApplications();
  const application = applications.find((a) => a.id === id);

  const [updating, setUpdating] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [uploadingOffer, setUploadingOffer] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!session.user) return null;

  const handleStatusChange = async (status: 'shortlisted' | 'selected' | 'rejected') => {
    setUpdating(true);
    setMessage(null);
    const res = await updateStatus(id, status);
    if (!res.success) setMessage({ type: 'error', text: res.error || 'Failed to update status.' });
    setUpdating(false);
  };

  const handleOfferLetterUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerFile) return;
    setUploadingOffer(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('offer_letter', offerFile);
    const res = await uploadOfferLetter(id, formData);
    if (res.success) {
      setMessage({ type: 'success', text: 'Offer letter sent to the student!' });
      setOfferFile(null);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to send offer letter.' });
    }
    setUploadingOffer(false);
  };

  const handleChat = async () => {
    if (!application) return;
    setChatLoading(true);
    try {
      const response = await messagingApi.startConversation(application.student.id as string);
      if (response.data && (response.data as any).id) {
        router.push(`/dashboard/chat?conversation=${(response.data as any).id}`);
      } else if (response.error) {
        setMessage({ type: 'error', text: response.error });
      }
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={logout} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Internship Application</h1>
            <p className="text-sm text-muted-foreground">Application ID: {id}</p>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground">Loading application...</p>
          </Card>
        ) : !application ? (
          <Card className="p-10 text-center space-y-4">
            <p className="text-muted-foreground">Application not found.</p>
            <Button onClick={() => router.push('/dashboard/advocate/internships')}>Back to Internships</Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {message && (
              <div className={`p-3 rounded-lg border flex gap-2 text-sm ${
                message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-destructive/10 border-destructive/30'
              }`}>
                {message.type === 'success'
                  ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                {message.text}
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <CardTitle>{application.student.name}</CardTitle>
                    <CardDescription>{application.internship_title}</CardDescription>
                  </div>
                  <Badge className={STATUS_STYLES[application.status] || 'bg-gray-100 text-gray-800'}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium text-foreground">{application.student.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Law College</p>
                    <p className="font-medium text-foreground">{application.student.law_college || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Year of Study</p>
                    <p className="font-medium text-foreground">{application.student.year_of_study || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Applied On</p>
                    <p className="font-medium text-foreground">{new Date(application.applied_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {application.cover_note && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Cover Note</p>
                    <p className="text-sm text-foreground">{application.cover_note}</p>
                  </div>
                )}

                {application.cv_url && (
                  <a href={application.cv_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download CV
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {(application.status === 'pending' || application.status === 'shortlisted') && (
              <Card>
                <CardHeader><CardTitle className="text-base">Review Application</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {application.status === 'pending' && (
                    <Button variant="outline" disabled={updating} onClick={() => handleStatusChange('shortlisted')}>
                      Shortlist
                    </Button>
                  )}
                  <Button disabled={updating} onClick={() => handleStatusChange('selected')}>
                    Select as Intern
                  </Button>
                  <Button variant="destructive" disabled={updating} onClick={() => handleStatusChange('rejected')}>
                    Reject
                  </Button>
                </CardContent>
              </Card>
            )}

            {application.status === 'selected' && (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Chat with Intern</CardTitle></CardHeader>
                  <CardContent>
                    <Button variant="outline" className="gap-2" disabled={chatLoading} onClick={handleChat}>
                      <MessageSquare className="w-4 h-4" />
                      {chatLoading ? 'Opening chat...' : 'Chat with Student'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {application.offer_letter_url ? 'Offer Letter Sent' : 'Send Offer Letter'}
                    </CardTitle>
                    <CardDescription>Upload a signed offer letter for this student</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {application.offer_letter_url && (
                      <a href={application.offer_letter_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2 mb-3">
                          <Download className="w-4 h-4" />
                          View Sent Offer Letter
                        </Button>
                      </a>
                    )}
                    <form onSubmit={handleOfferLetterUpload} className="space-y-3">
                      <div>
                        <Label className="text-xs">Offer Letter (PDF/DOC/DOCX)</Label>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="mt-1 text-sm"
                          onChange={(e) => setOfferFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <Button type="submit" disabled={!offerFile || uploadingOffer} className="gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadingOffer ? 'Sending...' : application.offer_letter_url ? 'Send Updated Letter' : 'Send Offer Letter'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
