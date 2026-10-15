import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for Client Components and browser-only code.
 *
 * This client uses Supabase's cookie storage adapter so its session is also
 * available to Server Components and Route Handlers.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return createBrowserClient(url, publishableKey);
}
