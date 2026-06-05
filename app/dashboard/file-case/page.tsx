'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCreateCase } from '@/hooks/useCases';
import { advocatesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardHeader from '@/components/DashboardHeader';
import { ArrowLeft, AlertCircle, CheckCircle, User, Star } from 'lucide-react';

export default function FileCasePage() {
  const { session } = useAuth();
  const router = useRouter();
  const { createCase, isLoading } = useCreateCase();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [advocatesLoading, setAdvocatesLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    case_type: 'civil',
    description: '',
    advocate: '',
    court_name: '',
    court_address: '',
    judge_name: '',
    filing_date: '',
    advocate_fee: '',
  });

  // Load approved advocates
  useEffect(() => {
    const load = async () => {
      try {
        const res = await advocatesApi.listAdvocates();
        if (res.data) {
          const data = res.data as any;
          const list = Array.isArray(data) ? data : (data.results ?? []);
          setAdvocates(list.filter((a: any) => a.approval_status === 'approved'));
        }
      } finally {
        setAdvocatesLoading(false);
      }
    };
    load();
  }, []);

  if (!session.user) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.advocate) {
      setMessage({ type: 'error', text: 'Please select an advocate for your case.' });
      return;
    }

    const payload: any = {
      title: formData.title,
      case_type: formData.case_type,
      description: formData.description,
      advocate: formData.advocate,
    };

    if (formData.court_name) payload.court_name = formData.court_name;
    if (formData.court_address) payload.court_address = formData.court_address;
    if (formData.judge_name) payload.judge_name = formData.judge_name;
    if (formData.filing_date) payload.filing_date = formData.filing_date;
    if (formData.advocate_fee) payload.advocate_fee = parseFloat(formData.advocate_fee);

    const result = await createCase(payload);

    if (result.success) {
      const caseId = (result.data as any)?.id;
      setMessage({ type: 'success', text: 'Case filed successfully! Redirecting...' });
      setTimeout(() => {
        router.push(caseId ? `/dashboard/case/${caseId}` : '/dashboard');
      }, 1200);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to file case' });
    }
  };

  const selectedAdvocate = advocates.find(a => String(a.id) === formData.advocate);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} onLogout={() => {}} />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4 sm:mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Button>
        </Link>

        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">File a New Case</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Provide details about your legal matter and assign an advocate
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <div className={`mb-6 p-4 rounded-lg border flex gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-destructive/10 border-destructive/30'
              }`}>
                {message.type === 'success'
                  ? <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  : <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Advocate Selection ── */}
              <div className="space-y-2">
                <Label htmlFor="advocate">Select Advocate *</Label>
                {advocatesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading advocates...</p>
                ) : advocates.length === 0 ? (
                  <p className="text-sm text-destructive">No approved advocates available. Please try again later.</p>
                ) : (
                  <Select value={formData.advocate} onValueChange={(v) => handleChange('advocate', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an advocate for your case..." />
                    </SelectTrigger>
                    <SelectContent>
                      {advocates.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{a.name}</span>
                            <span className="text-xs text-muted-foreground">{a.specialization || 'General Practice'}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Selected advocate preview */}
                {selectedAdvocate && (
                  <div className="mt-2 p-3 rounded-lg border bg-primary/5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{selectedAdvocate.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedAdvocate.specialization || 'General Practice'} · {selectedAdvocate.experience_years || 0} yrs exp</p>
                    </div>
                    {selectedAdvocate.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{Number(selectedAdvocate.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Case Title ── */}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief, descriptive title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">e.g., "Traffic Accident Compensation Claim"</p>
              </div>

              {/* ── Case Type ── */}
              <div className="space-y-2">
                <Label>Case Type *</Label>
                <Select value={formData.case_type} onValueChange={(v) => handleChange('case_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civil">Civil Law</SelectItem>
                    <SelectItem value="criminal">Criminal Law</SelectItem>
                    <SelectItem value="family">Family Law</SelectItem>
                    <SelectItem value="property">Property Law</SelectItem>
                    <SelectItem value="corporate">Corporate Law</SelectItem>
                    <SelectItem value="labour">Labour Law</SelectItem>
                    <SelectItem value="consumer">Consumer Law</SelectItem>
                    <SelectItem value="writ">Writ Petition</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ── Description ── */}
              <div className="space-y-2">
                <Label htmlFor="description">Case Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your case, relevant dates, parties involved, and key facts..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                  required
                />
              </div>

              {/* ── Court Details ── */}
              <div className="space-y-2">
                <Label htmlFor="court_name">Court Name (Optional)</Label>
                <Input
                  id="court_name"
                  placeholder="e.g., Delhi High Court"
                  value={formData.court_name}
                  onChange={(e) => handleChange('court_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="court_address">Court Address (Optional)</Label>
                <Textarea
                  id="court_address"
                  placeholder="Court address..."
                  value={formData.court_address}
                  onChange={(e) => handleChange('court_address', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filing_date">Filing Date (Optional)</Label>
                  <Input
                    id="filing_date"
                    type="date"
                    value={formData.filing_date}
                    onChange={(e) => handleChange('filing_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advocate_fee">Advocate Fee ₹ (Optional)</Label>
                  <Input
                    id="advocate_fee"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50000"
                    value={formData.advocate_fee}
                    onChange={(e) => handleChange('advocate_fee', e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">What happens next?</p>
                <ul className="space-y-1 text-xs">
                  <li>1. Your case is saved and assigned to the selected advocate</li>
                  <li>2. The advocate can view it in their dashboard immediately</li>
                  <li>3. You can upload documents right after filing</li>
                  <li>4. Track status, hearings & updates from your dashboard</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">Cancel</Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={isLoading || advocatesLoading}>
                  {isLoading ? 'Filing...' : 'File Case'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
