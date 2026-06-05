'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCases, useDashboardStats } from '@/hooks/useCases';
import { profileApi } from '@/lib/api';
import { messagingApi } from '@/lib/messaging-api';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText, TrendingUp, Star, Clock, RefreshCw,
  Calendar, MessageSquare, User, Eye, Briefcase, AlertCircle
} from 'lucide-react';

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const { cases, isLoading: casesLoading } = useCases();
  const { stats } = useDashboardStats();

  // Profile
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Messaging
  const [conversations, setConversations] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  useEffect(() => {
    profileApi.getProfile().then((res) => {
      if (res.data) setProfile(res.data);
      setProfileLoading(false);
    });
  }, []);

  useEffect(() => {
    const load = async (initial = false) => {
      try {
        const res = await messagingApi.listConversations();
        if (res.data) {
          const data = res.data as any;
          setConversations(Array.isArray(data) ? data : (data.results ?? []));
        }
      } finally {
        if (initial) setConvLoading(false);
      }
    };
    load(true);
    const interval = setInterval(() => load(false), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      filed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      hearing: 'bg-purple-100 text-purple-800',
      evidence: 'bg-orange-100 text-orange-800',
      arguments: 'bg-indigo-100 text-indigo-800',
      judgment: 'bg-pink-100 text-pink-800',
      closed: 'bg-green-100 text-green-800',
      dismissed: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 shadow-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">Advocate Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome, {profile?.name || user.name}
          </h1>
          <p className="text-muted-foreground mt-1">Manage your cases and client interactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Cases', value: stats?.active_cases ?? cases.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Experience', value: profile?.experience_years ? `${profile.experience_years} yrs` : '—', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
            { label: 'Specialization', value: profile?.specialization || '—', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', small: true },
            { label: 'Approval Status', value: profile?.approval_status || '—', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', capitalize: true },
          ].map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`font-bold mt-0.5 ${stat.small ? 'text-sm' : 'text-2xl'} ${stat.capitalize ? 'capitalize' : ''}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Messages count card */}
        <Card
          className="mb-6 cursor-pointer hover:shadow-md transition-shadow border-primary/20 bg-primary/5"
          onClick={() => router.push('/dashboard/chat')}
        >
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center relative">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'Messages'}
                </p>
                <p className="text-xs text-muted-foreground">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''} · click to open inbox</p>
              </div>
            </div>
            {conversations.some(c => c.status === 'case_requested') && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                ⚖️ {conversations.filter(c => c.status === 'case_requested').length} case request{conversations.filter(c => c.status === 'case_requested').length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cases — left 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your Cases</h2>
                <p className="text-sm text-muted-foreground">Active cases assigned to you</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/advocate/cases')}>
                View All
              </Button>
            </div>

            {casesLoading ? (
              <Card><CardContent className="pt-6 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto" /></CardContent></Card>
            ) : cases.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">No cases assigned yet</p>
                  <p className="text-xs text-muted-foreground mt-1">When customers file a case selecting you, it will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {cases.slice(0, 5).map((c: any) => (
                  <Card key={c.id} className="hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                    onClick={() => router.push(`/dashboard/advocate/cases/${c.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{c.title}</CardTitle>
                          {c.cnr_number && <CardDescription className="text-xs">CNR: {c.cnr_number}</CardDescription>}
                        </div>
                        <Badge className={`${getStatusColor(c.status)} flex-shrink-0 text-xs`}>
                          {c.status_display || c.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-medium text-xs">{c.case_type_display || c.case_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Client</p>
                          <p className="font-medium text-xs truncate">{c.customer_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Filing Date</p>
                          <p className="font-medium text-xs">{c.filing_date ? new Date(c.filing_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      {c.next_hearing_date && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                          <Calendar className="w-3 h-3" />
                          Next hearing: {new Date(c.next_hearing_date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {cases.length > 5 && (
                  <Button variant="ghost" className="w-full text-sm" onClick={() => router.push('/dashboard/advocate/cases')}>
                    View all {cases.length} cases →
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right column — Messages + Profile */}
          <div className="space-y-4">
            {/* Recent messages */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Recent Messages</h2>
                <Button size="sm" variant="ghost" onClick={() => router.push('/dashboard/chat')} className="text-xs">View All</Button>
              </div>
              {convLoading ? (
                <Card><CardContent className="pt-4 text-center text-sm text-muted-foreground">Loading...</CardContent></Card>
              ) : conversations.length === 0 ? (
                <Card><CardContent className="pt-4 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-xs text-muted-foreground">No messages yet</p>
                </CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {conversations.slice(0, 4).map((conv: any) => {
                    const lastMsg = conv.messages?.[conv.messages.length - 1];
                    return (
                      <Card key={conv.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/dashboard/chat?conversation=${conv.id}`)}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-xs truncate">{conv.customer?.name}</p>
                              {conv.unread_count > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs ml-1 flex-shrink-0">{conv.unread_count}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{lastMsg?.content || 'No messages yet'}</p>
                          </div>
                        </div>
                        {conv.status === 'case_requested' && (
                          <div className="mt-1.5 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                            ⚖️ Case request pending — tap to review
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Profile</CardTitle>
                <CardDescription className="text-xs">Professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {profileLoading ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{profile?.email || user.email}</p>
                    </div>
                    {profile?.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium text-sm">{profile.phone}</p>
                      </div>
                    )}
                    {profile?.bio && (
                      <div>
                        <p className="text-xs text-muted-foreground">Bio</p>
                        <p className="text-sm text-foreground line-clamp-3">{profile.bio}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Specialization</p>
                      <Badge variant="secondary" className="text-xs">{profile?.specialization || 'General Practice'}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Bar Council ID</p>
                        <p className="text-xs font-medium">{profile?.bar_council_id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className={
                          profile?.approval_status === 'approved' ? 'bg-green-100 text-green-800 text-xs' :
                          profile?.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800 text-xs' :
                          'bg-red-100 text-red-800 text-xs'
                        }>
                          {profile?.approval_status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => router.push('/dashboard/profile')}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
