'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCases } from '@/hooks/useCases';
import { useUpcomingHearings } from '@/hooks/useCases';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar, Clock, MapPin, Gavel, Bell, CheckCircle,
  AlertCircle, Search, RefreshCw, Eye, Filter
} from 'lucide-react';
import Link from 'next/link';

export default function HearingUpdatesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { cases, isLoading: casesLoading, error: casesError, refetch } = useCases({
    status: filterStatus || undefined,
  });

  const { hearings, isLoading: hearingsLoading } = useUpcomingHearings();

  const filteredCases = cases.filter((c: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.cnr_number?.toLowerCase().includes(q) ||
      c.customer_name?.toLowerCase().includes(q) ||
      c.advocate_name?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      filed: 'bg-blue-100 text-blue-800 border-blue-200',
      hearing: 'bg-purple-100 text-purple-800 border-purple-200',
      closed: 'bg-green-100 text-green-800 border-green-200',
      dismissed: 'bg-red-100 text-red-800 border-red-200',
    };
    return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={() => {}} />
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Gavel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Court Hearing Updates</h1>
            <p className="text-sm text-muted-foreground">Live updates on your court cases and hearings</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hearingsLoading ? '…' : hearings.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Hearings</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {casesLoading ? '…' : cases.filter((c: any) => c.status === 'pending').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending Cases</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gavel className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {casesLoading ? '…' : cases.filter((c: any) => c.status === 'hearing').length}
                </p>
                <p className="text-xs text-muted-foreground">In Hearing</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {casesLoading ? '…' : cases.filter((c: any) => ['closed', 'dismissed'].includes(c.status)).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Hearings Section */}
        {hearings.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Upcoming Hearings
            </h2>
            <div className="space-y-3">
              {hearings.map((h: any) => (
                <div key={h.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{h.hearing_type?.replace('_', ' ').toUpperCase()}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(h.hearing_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(h.hearing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {h.court_room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {h.court_room}
                        </span>
                      )}
                    </div>
                    {h.purpose && <p className="text-xs text-muted-foreground mt-1 truncate">{h.purpose}</p>}
                  </div>
                  <Badge className={h.is_completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {h.is_completed ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cases by title, CNR, client or advocate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="filed">Filed</option>
              <option value="hearing">Hearing</option>
              <option value="evidence">Evidence</option>
              <option value="closed">Closed</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Cases List */}
        {casesError && (
          <Card className="p-6 text-center text-destructive mb-4">{casesError}</Card>
        )}

        {casesLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading cases...</Card>
        ) : filteredCases.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No cases found.</Card>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((c: any) => (
              <Card key={c.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base truncate">{c.title}</h3>
                      <Badge className={getStatusColor(c.status)}>
                        {c.status_display || c.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground mt-2">
                      {c.cnr_number && (
                        <span className="flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> {c.cnr_number}
                        </span>
                      )}
                      {c.advocate_name && (
                        <span className="flex items-center gap-1">
                          <Search className="w-3 h-3" /> {c.advocate_name}
                        </span>
                      )}
                      {c.next_hearing_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {new Date(c.next_hearing_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/dashboard/case/${c.id}`} className="flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
