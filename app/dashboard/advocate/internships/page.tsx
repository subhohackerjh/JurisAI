'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useInternships, useCreateInternship, useMyApplications } from '@/hooks/useInternships';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DashboardHeader from '@/components/DashboardHeader';
import { AlertCircle, CheckCircle, GraduationCap, Plus } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdvocateInternshipsPage() {
  const { session, logout } = useAuth();
  const { internships, isLoading, error, refetch } = useInternships({ mine: true });
  const { applications, isLoading: applicationsLoading } = useMyApplications();
  const { createInternship, isLoading: creating } = useCreateInternship();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', practice_area: '', duration_months: '', stipend: '', openings: '1',
  });
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!session.user) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    const res = await createInternship({
      title: form.title,
      description: form.description,
      practice_area: form.practice_area || undefined,
      duration_months: form.duration_months ? parseInt(form.duration_months) : undefined,
      stipend: form.stipend ? parseFloat(form.stipend) : undefined,
      openings: form.openings ? parseInt(form.openings) : 1,
    });
    if (res.success) {
      setFormMsg({ type: 'success', text: 'Internship posted!' });
      setForm({ title: '', description: '', practice_area: '', duration_months: '', stipend: '', openings: '1' });
      setShowForm(false);
      refetch();
    } else {
      setFormMsg({ type: 'error', text: res.error || 'Failed to post internship.' });
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Internships</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Post internships and review applicants</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Post New Internship'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">New Internship Posting</CardTitle></CardHeader>
            <CardContent>
              {formMsg && (
                <div className={`mb-4 p-3 rounded-lg border flex gap-2 text-sm ${
                  formMsg.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-destructive/10 border-destructive/30'
                }`}>
                  {formMsg.type === 'success'
                    ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                  {formMsg.text}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <Label className="text-xs">Title *</Label>
                  <Input
                    className="mt-1 text-sm"
                    placeholder="e.g., Litigation Intern"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Description *</Label>
                  <Textarea
                    className="mt-1 text-sm"
                    placeholder="What will the intern be doing?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Practice Area</Label>
                    <Input
                      className="mt-1 text-sm"
                      placeholder="Criminal Law"
                      value={form.practice_area}
                      onChange={(e) => setForm({ ...form, practice_area: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Duration (months)</Label>
                    <Input
                      type="number"
                      className="mt-1 text-sm"
                      value={form.duration_months}
                      onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Stipend (₹, optional)</Label>
                    <Input
                      type="number"
                      className="mt-1 text-sm"
                      value={form.stipend}
                      onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Openings</Label>
                    <Input
                      type="number"
                      min="1"
                      className="mt-1 text-sm"
                      value={form.openings}
                      onChange={(e) => setForm({ ...form, openings: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Posting...' : 'Post Internship'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-foreground">Your Postings</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : internships.length === 0 ? (
            <p className="text-muted-foreground">You haven't posted any internships yet.</p>
          ) : (
            internships.map((internship) => (
              <Card key={internship.id}>
                <CardHeader>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-lg">{internship.title}</CardTitle>
                      <CardDescription>{internship.applications_count || 0} application(s)</CardDescription>
                    </div>
                    <Badge variant={internship.status === 'open' ? 'default' : 'secondary'}>
                      {internship.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Applicants</h2>
          {applicationsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground">No applications received yet.</p>
          ) : (
            applications.map((app) => (
              <Link key={app.id} href={`/dashboard/advocate/internships/${app.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-foreground">{app.student.name}</p>
                      <p className="text-sm text-muted-foreground">{app.internship_title}</p>
                    </div>
                    <Badge className={STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-800'}>
                      {app.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
