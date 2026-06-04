import { cn } from '@/lib/utils';

/** Consistent main content width and padding for dashboard pages */
export default function DashboardPageMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8', className)}>
      {children}
    </main>
  );
}
