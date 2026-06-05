'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCases } from '@/hooks/useCases';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Eye, Search, Calendar, FileText, User } from 'lucide-react';

export default function AdvocateCasesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { cases, isLoading, error, refetch } = useCases({ status: statusFilter || undefined });

  if (!user) return null;

  const filtered = cases.filter((c: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.cnr_number?.toLowerCase().includes(q) ||
      c.customer_name?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      filed: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      hearing: 'bg-purple-100 text-purple-700',
      evidence: 'bg-orange-100 text-orange-700',
      arguments: 'bg-indigo-100 text-indigo-700',
      judgment: 'bg-pink-100 text-pink-700',
      closed: 'bg-green-100 text-green-700',
      dismissed: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 max-w-6xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Cases</h1>
            <p className="text-sm text-muted-foreground">All cases assigned to you</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, CNR or client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="filed">Filed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="hearing">Hearing</SelectItem>
              <SelectItem value="evidence">Evidence</SelectItem>
              <SelectItem value="arguments">Arguments</SelectItem>
              <SelectItem value="judgment">Judgment</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', count: cases.length, color: 'text-foreground' },
            { label: 'Active', count: cases.filter((c: any) => ['filed','pending','hearing','evidence','arguments','judgment'].includes(c.status)).length, color: 'text-blue-600' },
            { label: 'Completed', count: cases.filter((c: any) => c.status === 'closed').length, color: 'text-green-600' },
            { label: 'Dismissed', count: cases.filter((c: any) => c.status === 'dismissed').length, color: 'text-red-600' },
          ].map((s) => (
            <Card key={s.label} className="p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Cases list */}
        {isLoading ? (
          <Card className="p-10 text-center text-muted-foreground">Loading cases...</Card>
        ) : error ? (
          <Card className="p-10 text-center text-destructive">{error}</Card>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No cases found.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((c: any) => (
              <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{c.title}</h3>
                      <Badge className={`${getStatusColor(c.status)} text-xs`}>
                        {c.status_display || c.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
                      {c.cnr_number && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {c.cnr_number}
                        </span>
                      )}
                      {c.customer_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {c.customer_name}
                        </span>
                      )}
                      {c.next_hearing_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {new Date(c.next_hearing_date).toLocaleDateString()}
                        </span>
                      )}
                      <span>{c.case_type_display || c.case_type}</span>
                      <span>{c.documents_count || 0} docs · {c.hearings_count || 0} hearings</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
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
      </main>
    </div>
  );
}
