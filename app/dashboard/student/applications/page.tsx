'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMyApplications } from '@/hooks/useInternships';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import { messagingApi } from '@/lib/messaging-api';
import { AlertCircle, Download, MessageSquare, FileText } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function StudentApplicationsPage() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const { applications, isLoading, error } = useMyApplications();
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);

  const handleChat = async (advocateId: string) => {
    setChatLoadingId(advocateId);
    try {
      const response = await messagingApi.startConversation(advocateId);
      if (response.data && (response.data as any).id) {
        router.push(`/dashboard/chat?conversation=${(response.data as any).id}`);
      } else if (response.error) {
        alert(response.error);
      }
    } finally {
      setChatLoadingId(null);
    }
  };

  if (!session.user) return null;

  return (
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">My Applications</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Track the status of internships you've applied to</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't applied to any internships yet.</p>
            <Link href="/dashboard/student/internships">
              <Button>Browse Internships</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-lg">{app.internship_title}</CardTitle>
                      <CardDescription>{app.advocate_name}</CardDescription>
                    </div>
                    <Badge className={STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-800'}>
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {app.status === 'selected' && app.advocate_id && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={chatLoadingId === app.advocate_id}
                      onClick={() => handleChat(app.advocate_id!)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {chatLoadingId === app.advocate_id ? 'Opening chat...' : 'Chat with Advocate'}
                    </Button>
                  )}
                  {app.offer_letter_url && (
                    <a href={app.offer_letter_url} target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2">
                        <Download className="w-4 h-4" />
                        Download Offer Letter
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
