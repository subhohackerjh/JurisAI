'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { apiCall } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star className={`w-6 h-6 ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function RateAdvocateContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const advocateId = searchParams.get('advocate_id');
  const caseId = searchParams.get('case_id');

  const [advocate, setAdvocate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [ratings, setRatings] = useState({
    rating: 0,
    professionalism: 0,
    communication: 0,
    expertise: 0,
    timeliness: 0,
  });
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!advocateId) { setLoading(false); return; }
    apiCall<any>(`/auth/advocates/${advocateId}/`).then(res => {
      if (res.data) setAdvocate(res.data);
      setLoading(false);
    });
  }, [advocateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratings.rating === 0) { setError('Please give an overall rating'); return; }
    setSubmitting(true);
    setError('');
    const res = await apiCall('/feedback/ratings/advocate/', {
      method: 'POST',
      body: JSON.stringify({
        advocate: advocateId,
        related_case: caseId || undefined,
        rating: ratings.rating,
        professionalism: ratings.professionalism || undefined,
        communication: ratings.communication || undefined,
        expertise: ratings.expertise || undefined,
        timeliness: ratings.timeliness || undefined,
        review: review.trim() || undefined,
      }),
    });
    if (res.error) { setError(res.error); setSubmitting(false); return; }
    setSubmitted(true);
    setSubmitting(false);
  };

  if (!user) return null;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (submitted) return (
    <div className="max-w-md mx-auto py-16 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
      <p className="text-muted-foreground">Your review helps others find the right advocate.</p>
      <Button className="mt-6" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-1">Rate Your Advocate</h1>
        {advocate && (
          <p className="text-muted-foreground text-sm mb-6">
            Share your experience with <span className="font-medium text-foreground">{advocate.name}</span>
            {advocate.specialization ? ` · ${advocate.specialization}` : ''}
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <StarRating label="Overall Rating *" value={ratings.rating}
              onChange={v => setRatings(r => ({ ...r, rating: v }))} />
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detailed Ratings (optional)</p>
              <StarRating label="Professionalism" value={ratings.professionalism}
                onChange={v => setRatings(r => ({ ...r, professionalism: v }))} />
              <StarRating label="Communication" value={ratings.communication}
                onChange={v => setRatings(r => ({ ...r, communication: v }))} />
              <StarRating label="Legal Expertise" value={ratings.expertise}
                onChange={v => setRatings(r => ({ ...r, expertise: v }))} />
              <StarRating label="Timeliness" value={ratings.timeliness}
                onChange={v => setRatings(r => ({ ...r, timeliness: v }))} />
            </div>
          </div>

          <div>
            <Label>Written Review (optional)</Label>
            <Textarea
              className="mt-1.5 resize-none"
              rows={4}
              placeholder="Describe your experience with this advocate..."
              value={review}
              onChange={e => setReview(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting || ratings.rating === 0} className="flex-1">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function RateAdvocatePage() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardHeader user={user} onLogout={logout} />}
      <main className="px-4 py-6">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
          <RateAdvocateContent />
        </Suspense>
      </main>
    </div>
  );
}
