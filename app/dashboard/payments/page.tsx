'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { apiCall } from '@/lib/api';
import {
  IndianRupee, Clock, CheckCircle2, XCircle, CreditCard,
  Loader2, Receipt, User, AlertCircle, RefreshCw
} from 'lucide-react';

interface Payment {
  id: string;
  order_id: string;
  advocate_name: string;
  customer_name: string;
  payment_for: string;
  amount: string;
  status: string;
  payment_method: string;
  created_at: string;
  paid_at: string | null;
  description: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  paid:      { label: 'Paid',      color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  created:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  failed:    { label: 'Failed',    color: 'bg-red-100 text-red-700',      icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600',    icon: XCircle },
  refunded:  { label: 'Refunded',  color: 'bg-blue-100 text-blue-700',    icon: RefreshCw },
};

const PAYMENT_FOR_LABELS: Record<string, string> = {
  consultation:      'Consultation Fee',
  case_filing:       'Case Filing Fee',
  document_drafting: 'Document Drafting',
  retainer:          'Retainer Fee',
};

export default function PaymentsPage() {
  const { user, logout } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [form, setForm] = useState({
    advocate_id: '',
    payment_for: 'consultation',
    amount: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadPayments();
    if (user?.role === 'customer') loadAdvocates();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const res = await apiCall<Payment[]>('/payments/');
    if (res.data) setPayments(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  const loadAdvocates = async () => {
    const res = await apiCall<any>('/auth/advocates/');
    if (res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
      setAdvocates(list);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.advocate_id || !form.amount) { setFormError('Please fill all required fields'); return; }
    setSubmitting(true);
    setFormError('');

    const res = await apiCall<any>('/payments/create/', {
      method: 'POST',
      body: JSON.stringify({
        advocate_id: form.advocate_id,
        payment_for: form.payment_for,
        amount: parseFloat(form.amount),
        description: form.description,
      }),
    });

    if (res.error) { setFormError(res.error); setSubmitting(false); return; }

    const { payment_session_id, order_id } = res.data as any;

    // Load Cashfree JS SDK and open checkout
    await loadCashfreeSDK();
    const cashfree = (window as any).Cashfree;
    if (!cashfree) { setFormError('Payment SDK failed to load. Please try again.'); setSubmitting(false); return; }

    const cfInstance = cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox' });
    cfInstance.checkout({
      paymentSessionId: payment_session_id,
      returnUrl: `${window.location.origin}/dashboard/payments/status?order_id=${order_id}`,
    }).then(() => {
      setShowForm(false);
      setSubmitting(false);
      loadPayments();
    }).catch(() => {
      setFormError('Payment cancelled or failed. Please try again.');
      setSubmitting(false);
    });
  };

  const loadCashfreeSDK = () => new Promise<void>((resolve) => {
    if ((window as any).Cashfree) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={logout} />

      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="text-sm text-muted-foreground">
                {user.role === 'customer' ? 'Make & track your payments' : 'Your earnings & transactions'}
              </p>
            </div>
          </div>
          {user.role === 'customer' && (
            <Button onClick={() => setShowForm(v => !v)} className="bg-green-600 hover:bg-green-700">
              <CreditCard className="w-4 h-4 mr-2" />
              {showForm ? 'Cancel' : 'New Payment'}
            </Button>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Transactions', value: payments.length, icon: Receipt, color: 'text-blue-600' },
            { label: 'Paid', value: payments.filter(p => p.status === 'paid').length, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Pending', value: payments.filter(p => ['created','pending'].includes(p.status)).length, icon: Clock, color: 'text-yellow-600' },
            { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600' },
          ].map((stat, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 opacity-20 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* New Payment Form */}
        {showForm && user.role === 'customer' && (
          <Card className="p-6 mb-6 border-green-200 bg-green-50/30">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" /> Initiate Payment
            </h2>
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}
            <form onSubmit={handlePay} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Advocate *</Label>
                <Select value={form.advocate_id} onValueChange={v => setForm(f => ({ ...f, advocate_id: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select advocate" />
                  </SelectTrigger>
                  <SelectContent>
                    {advocates.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} — {a.specialization || 'General'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment For *</Label>
                <Select value={form.payment_for} onValueChange={v => setForm(f => ({ ...f, payment_for: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_FOR_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount (₹) *</Label>
                <Input
                  type="number" min="1" step="1"
                  placeholder="e.g. 2500"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Additional notes…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1 resize-none" rows={2}
                />
              </div>

              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  {submitting ? 'Opening checkout…' : `Pay ₹${form.amount || '0'}`}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Secured by Cashfree Payments — UPI, Cards, Net Banking accepted
              </p>
            </div>
          </Card>
        )}

        {/* Transactions list */}
        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Transaction History</h2>
            <Button variant="ghost" size="sm" onClick={loadPayments}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground font-medium">No transactions yet</p>
              {user.role === 'customer' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Click "New Payment" to pay an advocate.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {payments.map(payment => {
                const sc = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                const StatusIcon = sc.icon;
                return (
                  <div key={payment.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {user.role === 'customer'
                            ? `To: ${payment.advocate_name || 'Advocate'}`
                            : `From: ${payment.customer_name || 'Customer'}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {PAYMENT_FOR_LABELS[payment.payment_for] || payment.payment_for}
                          {payment.description ? ` · ${payment.description}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(payment.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                          {payment.payment_method ? ` · ${payment.payment_method}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{payment.order_id}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-base">
                        ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                      </p>
                      <Badge className={`text-xs mt-1 ${sc.color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {sc.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
