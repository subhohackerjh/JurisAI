'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCases, useDashboardStats } from '@/hooks/useCases';
import { messagingApi } from '@/lib/messaging-api';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Calendar, FileText, UserCheck,
  AlertCircle, Eye, MessageSquare, User, Send
} from 'lucide-react';

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const { cases, isLoading: casesLoading } = useCases();
  const { stats } = useDashboardStats();

  // Messaging
  const [conversations, setConversations] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await messagingApi.listConversations();
        if (res.data) {
          const data = res.data as any;
          setConversations(Array.isArray(data) ? data : (data.results ?? []));
        }
      } finally {
        setConvLoading(false);
      }
    };
    load();
  }, []);

  // Backend already scopes cases by advocate role — all cases returned belong to this advocate
  const myCases = cases;

  if (!user) return null;

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
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Advocate Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name?.split(' ')[0]}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_cases || 0}</p>
                <p className="text-xs text-muted-foreground">Total Cases</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.active_cases || 0}</p>
                <p className="text-xs text-muted-foreground">Active Cases</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.completed_cases || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/dashboard/chat')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center relative">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">{conversations.length}</p>
                <p className="text-xs text-muted-foreground">
                  Messages{totalUnread > 0 ? ` (${totalUnread} new)` : ''}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cases (left, wider) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">My Cases</h2>
            {casesLoading ? (
              <Card className="p-8 text-center text-muted-foreground">Loading cases...</Card>
            ) : myCases.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No cases assigned yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Cases filed by customers selecting you will appear here.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {myCases.map((c: any) => (
                  <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                          <Badge className={`${getStatusColor(c.status)} flex-shrink-0 text-xs`}>
                            {c.status_display || c.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{c.case_type_display || c.case_type}</span>
                          {c.customer_name && <span>Client: {c.customer_name}</span>}
                          {c.next_hearing_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(c.next_hearing_date).toLocaleDateString()}
                            </span>
                          )}
                          <span>{c.documents_count || 0} docs</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/advocate/cases/${c.id}`)}
                        className="flex-shrink-0"
                      >
                        <Eye className="w-3 h-3 mr-1" /> Open
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Inbox (right) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/chat')}>
                View All
              </Button>
            </div>

            {convLoading ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">Loading...</Card>
            ) : conversations.length === 0 ? (
              <Card className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 5).map((conv: any) => {
                  const lastMsg = conv.messages?.[conv.messages.length - 1];
                  return (
                    <Card
                      key={conv.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/dashboard/chat?conversation=${conv.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{conv.customer?.name}</p>
                            {conv.unread_count > 0 && (
                              <Badge className="bg-primary text-primary-foreground text-xs ml-1 flex-shrink-0">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {lastMsg?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>

                      {/* Case request action */}
                      {conv.status === 'case_requested' && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center justify-between">
                          <span>⚖️ Case request pending</span>
                          <Button
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/chat?conversation=${conv.id}`);
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
                {conversations.length > 5 && (
                  <Button variant="ghost" className="w-full text-xs" onClick={() => router.push('/dashboard/chat')}>
                    View {conversations.length - 5} more conversations
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
