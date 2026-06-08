'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiCall } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Loader2, IndianRupee } from 'lucide-react';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'loading' | 'paid' | 'failed' | 'pending'>('loading');
  const [payment, setPayment] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) { setStatus('failed'); return; }
    verify();
  }, [orderId]);

  const verify = async () => {
    const res = await apiCall<any>(`/payments/verify/${orderId}/`);
    if (res.data) {
      const p = res.data.payment;
      setPayment(p);
      if (p.status === 'paid') setStatus('paid');
      else if (p.status === 'failed' || p.status === 'cancelled') setStatus('failed');
      else {
        // Poll up to 5 times
        if (attempts < 5) {
          setAttempts(a => a + 1);
          setTimeout(verify, 3000);
        } else {
          setStatus('pending');
        }
      }
    } else {
      setStatus('failed');
    }
  };

  if (status === 'loading') return (
    <div className="text-center py-16">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
      <p className="text-lg font-medium">Verifying payment…</p>
      <p className="text-sm text-muted-foreground mt-1">Please wait, do not close this page.</p>
    </div>
  );

  const configs = {
    paid: {
      icon: CheckCircle2, iconColor: 'text-green-500',
      title: 'Payment Successful!', subtitle: 'Your payment has been confirmed.',
      bg: 'bg-green-50 border-green-200',
    },
    failed: {
      icon: XCircle, iconColor: 'text-red-500',
      title: 'Payment Failed', subtitle: 'Your payment could not be processed.',
      bg: 'bg-red-50 border-red-200',
    },
    pending: {
      icon: Clock, iconColor: 'text-yellow-500',
      title: 'Payment Pending', subtitle: 'We are still confirming your payment.',
      bg: 'bg-yellow-50 border-yellow-200',
    },
  };

  const cfg = configs[status];
  const Icon = cfg.icon;

  return (
    <div className="text-center max-w-md mx-auto py-8">
      <div className={`p-8 rounded-2xl border ${cfg.bg} mb-6`}>
        <Icon className={`w-16 h-16 mx-auto mb-4 ${cfg.iconColor}`} />
        <h1 className="text-2xl font-bold mb-2">{cfg.title}</h1>
        <p className="text-muted-foreground">{cfg.subtitle}</p>

        {payment && (
          <div className="mt-6 p-4 bg-white rounded-xl text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs">{payment.order_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" />
                {parseFloat(payment.amount).toLocaleString('en-IN')}
              </span>
            </div>
            {payment.advocate_name && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Advocate</span>
                <span>{payment.advocate_name}</span>
              </div>
            )}
            {payment.paid_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid at</span>
                <span>{new Date(payment.paid_at).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={() => router.push('/dashboard/payments')}>
          View All Payments
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}
