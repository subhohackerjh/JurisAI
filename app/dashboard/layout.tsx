import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <svg
          className="absolute inset-0 h-full w-full opacity-40 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_60%,transparent_100%)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="appDotPattern" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#appDotPattern)" />
        </svg>
        <div className="absolute top-[-10%] left-[-5%] h-[50%] w-[35%] rounded-full bg-indigo-200/40 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[10%] right-[-5%] h-[45%] w-[30%] rounded-full bg-blue-200/40 blur-[100px] mix-blend-multiply" />
      </div>
      <div className="relative z-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
