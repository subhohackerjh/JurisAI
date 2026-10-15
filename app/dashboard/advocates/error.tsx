'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdvocatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Find Advocates] Page failed to render:', error);
  }, [error]);

  return (
    <main role="alert" className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive opacity-70" />
      <h1 className="mb-2 text-lg font-semibold">We couldn’t open Find Advocates</h1>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        The page encountered an unexpected error. Try loading it again. If the problem continues, return to your dashboard.
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
