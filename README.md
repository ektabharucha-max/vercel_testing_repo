# Inventory App

React + TypeScript (Vite) + Supabase. Email/password auth (login, registration) and a per-user inventory module (list, add, edit, delete).

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings → API):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
   Only the anon key goes here — never put the service role key in a `VITE_`-prefixed variable, since Vite ships those to the browser.
3. Link the Supabase CLI to your project and push the migration (see [supabase/migrations](supabase/migrations)):
   ```
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   This creates the `inventory` table and its row-level security policies. (Alternative: paste the SQL from the migration file into the Supabase Dashboard's SQL Editor and run it there instead of using the CLI.)
4. Install dependencies and start the dev server:
   ```
   npm install
   npm run dev
   ```

By default Supabase requires email confirmation before a new account can log in; after registering, check the inbox for the confirmation link (or disable confirmation in Authentication → Providers → Email for local testing).

## Structure

- `src/lib/supabaseClient.ts` — Supabase client
- `src/context/AuthContext.tsx` — auth state (session, sign in/up/out)
- `src/components/ProtectedRoute.tsx` — redirects to `/login` when signed out
- `src/pages/Login.tsx`, `Register.tsx` — auth forms
- `src/pages/Profile.tsx` — signed-in user view
- `src/pages/Inventory.tsx`, `src/components/InventoryFormModal.tsx` — inventory CRUD
- `supabase/schema.sql` — `inventory` table + RLS policies (each user only sees their own rows)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build