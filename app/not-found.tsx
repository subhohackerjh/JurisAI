import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⚖️</span>
        </div>
        <h1 className="text-7xl font-bold text-indigo-600 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
