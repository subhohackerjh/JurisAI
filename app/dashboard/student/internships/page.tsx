'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInternships, useMyApplications } from '@/hooks/useInternships';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DashboardHeader from '@/components/DashboardHeader';
import { apiCall } from '@/lib/api';
import { AlertCircle, CheckCircle, GraduationCap, IndianRupee, Upload } from 'lucide-react';

export default function StudentInternshipsPage() {
  const { session, logout } = useAuth();
  const { internships, isLoading, error } = useInternships();
  const { applications, apply } = useMyApplications();

  const [hasPaidFee, setHasPaidFee] = useState(false);
  const [checkingFee, setCheckingFee] = useState(true);
  const [payingFee, setPayingFee] = useState(false);
  const [feeError, setFeeError] = useState('');

  const [openApplyId, setOpenApplyId] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkFeeStatus();
  }, []);

  const checkFeeStatus = async () => {
    setCheckingFee(true);
    const res = await apiCall<any>('/payments/');
    if (res.data) {
      const payments = Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
      setHasPaidFee(payments.some((p: any) => p.payment_for === 'internship_fee' && p.status === 'paid'));
    }
    setCheckingFee(false);
  };

  const loadCashfreeSDK = () => new Promise<void>((resolve) => {
    if ((window as any).Cashfree) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  const handlePayFee = async () => {
    setPayingFee(true);
    setFeeError('');

    const res = await apiCall<any>('/payments/create/', {
      method: 'POST',
      body: JSON.stringify({ payment_for: 'internship_fee', amount: 399 }),
    });

    if (res.error) { setFeeError(res.error); setPayingFee(false); return; }

    const { payment_session_id, order_id } = res.data as any;

    await loadCashfreeSDK();
    const cashfree = (window as any).Cashfree;
    if (!cashfree) { setFeeError('Payment SDK failed to load. Please try again.'); setPayingFee(false); return; }

    const cfInstance = cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox' });
    cfInstance.checkout({
      paymentSessionId: payment_session_id,
      returnUrl: `${window.location.origin}/dashboard/payments/status?order_id=${order_id}`,
    }).then(() => {
      setPayingFee(false);
      checkFeeStatus();
    }).catch(() => {
      setFeeError('Payment cancelled or failed. Please try again.');
      setPayingFee(false);
    });
  };

  const alreadyApplied = (internshipId: string) => applications.some((a) => a.internship === internshipId);

  const handleApply = async (e: React.FormEvent, internshipId: string) => {
    e.preventDefault();
    if (!cvFile) { setApplyMsg({ type: 'error', text: 'Please attach your CV.' }); return; }

    setApplying(true);
    setApplyMsg(null);

    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('cover_note', coverNote);

    const res = await apply(internshipId, formData);
    if (res.success) {
      setApplyMsg({ type: 'success', text: 'Application submitted!' });
      setCvFile(null);
      setCoverNote('');
      setOpenApplyId(null);
    } else {
      setApplyMsg({ type: 'error', text: res.error || 'Failed to apply.' });
    }
    setApplying(false);
  };

  if (!session.user) return null;

  return (
    <div className="min-h-screen">
      <DashboardHeader user={session.user} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Browse Internships</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Apply to internships posted by advocates</p>
          </div>
        </div>

        {!checkingFee && !hasPaidFee && (
          <Card className="border-amber-200 bg-amber-50 mb-6">
            <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <IndianRupee className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="font-semibold text-foreground">One-time platform fee required</p>
                  <p className="text-sm text-muted-foreground">
                    Pay ₹399 once to unlock applying to any number of internships.
                  </p>
                  {feeError && <p className="text-sm text-destructive mt-1">{feeError}</p>}
                </div>
              </div>
              <Button className="rounded-full" onClick={handlePayFee} disabled={payingFee}>
                {payingFee ? 'Processing...' : 'Pay ₹399'}
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading internships...</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No open internships right now. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {internships.map((internship) => {
              const applied = alreadyApplied(internship.id);
              return (
                <Card key={internship.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-lg">{internship.title}</CardTitle>
                        <CardDescription>
                          {internship.advocate_name}
                          {internship.advocate_specialization ? ` — ${internship.advocate_specialization}` : ''}
                        </CardDescription>
                      </div>
                      {internship.practice_area && (
                        <Badge variant="secondary">{internship.practice_area}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{internship.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Duration</p>
                        <p className="font-medium text-foreground">{internship.duration_months ? `${internship.duration_months} mo` : 'Flexible'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Stipend</p>
                        <p className="font-medium text-foreground">{internship.stipend ? `₹${internship.stipend}` : 'Unpaid'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Openings</p>
                        <p className="font-medium text-foreground">{internship.openings}</p>
                      </div>
                    </div>

                    {applied ? (
                      <Badge className="bg-green-100 text-green-800">Already Applied</Badge>
                    ) : openApplyId === internship.id ? (
                      <form onSubmit={(e) => handleApply(e, internship.id)} className="space-y-3 p-3 rounded-lg border border-border bg-secondary/20">
                        {applyMsg && (
                          <div className={`p-3 rounded-lg border flex gap-2 text-sm ${
                            applyMsg.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-destructive/10 border-destructive/30'
                          }`}>
                            {applyMsg.type === 'success'
                              ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              : <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                            {applyMsg.text}
                          </div>
                        )}
                        <div>
                          <Label className="text-xs">CV *</Label>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="mt-1 text-sm"
                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cover Note</Label>
                          <Textarea
                            className="mt-1 text-sm"
                            placeholder="Why are you a good fit for this internship?"
                            value={coverNote}
                            onChange={(e) => setCoverNote(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={applying} className="gap-2">
                            <Upload className="w-4 h-4" />
                            {applying ? 'Submitting...' : 'Submit Application'}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setOpenApplyId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        onClick={() => hasPaidFee ? setOpenApplyId(internship.id) : handlePayFee()}
                        disabled={internship.status !== 'open'}
                      >
                        {internship.status !== 'open' ? 'Closed' : hasPaidFee ? 'Apply Now' : 'Pay ₹399 to Apply'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
