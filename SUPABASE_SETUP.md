# Supabase with Next.js

This project now includes Supabase's official SSR integration for the Next.js App Router. It creates separate browser and server clients and a Next.js 16 `proxy.ts` that refreshes cookie-based sessions.

## Configure a project

1. Create a Supabase project and open its **Connect** dialog.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from that dialog.
4. In Supabase Auth settings, add your local and production callback URLs, for example `http://localhost:3000/auth/callback` and `https://your-domain.com/auth/callback`.

Never put a `service_role` key in a `NEXT_PUBLIC_` variable or commit it. Use it only in trusted server-only code if an administrative operation genuinely requires it.

## Use Supabase in the app

Use the correct factory for where the code executes:

```ts
// Client Component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server Component, Server Action, or Route Handler
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

The callback endpoint at `/auth/callback` completes PKCE email-confirmation and OAuth sign-ins.

## Existing authentication

The application still uses its Django API and JWT-based `AuthContext`. This integration intentionally does not switch login, registration, profiles, or authorization to Supabase automatically: doing so without a user/data migration would create two independent accounts for each user.

When ready to migrate authentication, replace the login/register calls in `context/AuthContext.tsx` with `supabase.auth` calls, map Supabase user IDs to the backend records, and protect database tables with row-level security before reading or writing them from the browser.
