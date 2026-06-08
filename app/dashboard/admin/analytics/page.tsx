'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { apiCall } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Briefcase, MessageSquare, IndianRupee, TrendingUp,
  AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw,
  Scale, Star, ThumbsUp
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

interface Analytics {
  generated_at: string;
  users: {
    total: number;
    new_this_week: number;
    new_this_month: number;
    by_role: { role: string; count: number }[];
    advocates_pending: number;
    advocates_approved: number;
    daily_registrations: { day: string; count: number }[];
  };
  cases: {
    total: number;
    new_this_week: number;
    new_this_month: number;
    by_status: { status: string; count: number }[];
    by_type: { case_type: string; count: number }[];
    monthly_filings: { month: string; count: number }[];
  };
  feedback: {
    total: number;
    open: number;
    resolved: number;
    resolution_rate: number;
    by_type: { feedback_type: string; count: number }[];
    by_priority: { priority: string; count: number }[];
  };
  messaging: {
    total_conversations: number;
    active_conversations: number;
    total_messages: number;
    messages_this_week: number;
  };
  payments: {
    overview: {
      total: number;
      paid: number;
      total_revenue: number;
      pending: number;
    };
    revenue_by_month: { month: string; revenue: number; count: number }[];
  };
  top_advocates: {
    id: string;
    name: string;
    specialization: string;
    rating: string;
    cases_handled: number;
  }[];
}

function StatCard({
  title, value, subtitle, icon: Icon, trend, color = 'indigo'
}: {
  title: string; value: string | number; subtitle?: string;
  icon: any; trend?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    green:  'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-400 to-amber-500',
    blue:   'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    red:    'from-red-500 to-red-600',
  };

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[color]} opacity-10 rounded-full -mr-6 -mt-6`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 bg-gradient-to-br ${colorMap[color]} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/dashboard');
    else load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    setError('');
    const res = await apiCall<Analytics>('/analytics/dashboard/');
    if (res.data) setData(res.data as Analytics);
    else setError(res.error || 'Failed to load analytics');
    setLoading(false);
  };

  if (!user || user.role !== 'admin') return null;

  if (loading) return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">{error || 'No data available'}</p>
        <Button onClick={load}>Retry</Button>
      </div>
    </div>
  );

  const caseStatusData = data.cases.by_status.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
  }));

  const caseTypeData = data.cases.by_type.map(t => ({
    name: t.case_type.charAt(0).toUpperCase() + t.case_type.slice(1),
    count: t.count,
  }));

  const userRoleData = data.users.by_role.map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: r.count,
  }));

  const feedbackData = data.feedback.by_type.map(f => ({
    name: f.feedback_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count: f.count,
  }));

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />

      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Platform Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(data.generated_at).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={load} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users" value={data.users.total}
            subtitle={`+${data.users.new_this_week} this week`}
            icon={Users} color="indigo"
            trend={`+${data.users.new_this_month} this month`}
          />
          <StatCard
            title="Total Cases" value={data.cases.total}
            subtitle={`+${data.cases.new_this_week} this week`}
            icon={Briefcase} color="blue"
            trend={`+${data.cases.new_this_month} this month`}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(data.payments.overview?.total_revenue || 0).toLocaleString('en-IN')}`}
            subtitle={`${data.payments.overview?.paid || 0} paid transactions`}
            icon={IndianRupee} color="green"
          />
          <StatCard
            title="Messages Sent" value={data.messaging.total_messages}
            subtitle={`${data.messaging.messages_this_week} this week`}
            icon={MessageSquare} color="purple"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="advocates">Top Advocates</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly case filings */}
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Monthly Case Filings</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.cases.monthly_filings}>
                    <defs>
                      <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#caseGrad)" name="Cases" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Revenue by month */}
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Monthly Revenue (₹)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.payments.revenue_by_month}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{data.users.advocates_approved}</div>
                <p className="text-xs text-muted-foreground mt-1">Active Advocates</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-500">{data.users.advocates_pending}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending Approval</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{data.feedback.resolution_rate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Feedback Resolved</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{data.messaging.active_conversations}</div>
                <p className="text-xs text-muted-foreground mt-1">Active Chats</p>
              </Card>
            </div>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Users by Role</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={90}
                      dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}
                      labelLine={true}>
                      {userRoleData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-4">Daily Registrations (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.users.daily_registrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }}
                      tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                      dot={false} name="Registrations" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Advocate approval status */}
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Advocate Onboarding</h3>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.users.advocates_approved}</div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{
                      width: `${data.users.advocates_approved + data.users.advocates_pending > 0
                        ? (data.users.advocates_approved / (data.users.advocates_approved + data.users.advocates_pending)) * 100
                        : 0}%`
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">{data.users.advocates_pending}</div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
              {data.users.advocates_pending > 0 && (
                <Button size="sm" className="mt-4" onClick={() => router.push('/dashboard/admin/approvals')}>
                  Review Pending Advocates →
                </Button>
              )}
            </Card>
          </TabsContent>

          {/* ── CASES ── */}
          <TabsContent value="cases" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Cases by Status</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={caseStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                      dataKey="value" nameKey="name" paddingAngle={3}>
                      {caseStatusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-4">Cases by Type</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={caseTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Cases" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-5">
              <h3 className="font-semibold mb-4">Monthly Case Filings (12 Months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.cases.monthly_filings}>
                  <defs>
                    <linearGradient id="caseGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#caseGrad2)"
                    name="Cases Filed" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* ── PAYMENTS ── */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Transactions', value: data.payments.overview?.total || 0, icon: Scale, color: 'text-indigo-600' },
                { label: 'Successful', value: data.payments.overview?.paid || 0, icon: CheckCircle2, color: 'text-green-600' },
                { label: 'Pending', value: data.payments.overview?.pending || 0, icon: Clock, color: 'text-amber-500' },
                { label: 'Total Revenue', value: `₹${(data.payments.overview?.total_revenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600' },
              ].map((s, i) => (
                <Card key={i} className="p-4">
                  <s.icon className={`w-8 h-8 ${s.color} mb-2 opacity-70`} />
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </Card>
              ))}
            </div>

            <Card className="p-5">
              <h3 className="font-semibold mb-4">Monthly Revenue (₹)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.payments.revenue_by_month}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* ── FEEDBACK ── */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: data.feedback.total, color: 'text-indigo-600' },
                { label: 'Open', value: data.feedback.open, color: 'text-amber-500' },
                { label: 'Resolved', value: data.feedback.resolved, color: 'text-green-600' },
                { label: 'Resolution Rate', value: `${data.feedback.resolution_rate}%`, color: 'text-blue-600' },
              ].map((s, i) => (
                <Card key={i} className="p-4 text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Feedback by Type</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={feedbackData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                      {feedbackData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-4">Priority Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={data.feedback.by_priority.map(p => ({
                        name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
                        value: p.count,
                      }))}
                      cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {data.feedback.by_priority.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* ── TOP ADVOCATES ── */}
          <TabsContent value="advocates">
            <Card>
              <div className="p-4 border-b">
                <h3 className="font-semibold">Top Advocates by Cases Handled</h3>
              </div>
              {data.top_advocates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No advocate data available</div>
              ) : (
                <div className="divide-y">
                  {data.top_advocates.map((adv, i) => (
                    <div key={adv.id} className="p-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{adv.name}</p>
                        <p className="text-xs text-muted-foreground">{adv.specialization || 'General'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium">{parseFloat(adv.rating || '0').toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{adv.cases_handled} cases</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
