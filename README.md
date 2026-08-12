# Inventory App

React + TypeScript (Vite) + Supabase. Email/password auth (login, registration), role-based access (`user` / `superadmin`), a per-user inventory module, and a superadmin-only user management module.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings → API):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
   Only the anon key goes here — never put the service role key in a `VITE_`-prefixed variable, since Vite ships those to the browser.
3. Link the Supabase CLI to your project and push the migrations (see [supabase/migrations](supabase/migrations)):
   ```
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   This creates the `inventory` and `profiles` tables, RLS policies, and the trigger that auto-creates a `profiles` row (role `user`) whenever someone registers. (Alternative: paste each migration file's SQL into the Dashboard's SQL Editor and run it there instead of using the CLI.)
4. Register your first account through the app, then promote it to superadmin — RLS blocks anyone from doing this from the client, so run it once in the SQL Editor:
   ```sql
   update public.profiles set role = 'superadmin' where email = 'you@example.com';
   ```
5. Deploy the `admin-delete-user` Edge Function (used by the Users module to actually delete an account — this needs the service role key, which only exists inside the function, never in the browser):
   ```
   supabase functions deploy admin-delete-user
   ```
6. Install dependencies and start the dev server:
   ```
   npm install
   npm run dev
   ```

By default Supabase requires email confirmation before a new account can log in; after registering, check the inbox for the confirmation link (or disable confirmation in Authentication → Providers → Email for local testing).

## Roles

- **user** — default role on registration. Can manage their own inventory and profile.
- **superadmin** — additionally sees the **Users** nav link and `/users` page: list all users, change roles, activate/deactivate, or permanently delete an account. A superadmin cannot deactivate, delete, or demote their own account (guarded both in the UI and in the Edge Function).
- Deactivated users are signed out automatically on their next login attempt and shown a message instead of gaining access.

## Structure

- `src/lib/supabaseClient.ts` — Supabase client
- `src/context/AuthContext.tsx` — auth + profile/role state (session, profile, sign in/up/out, deactivation handling)
- `src/components/ProtectedRoute.tsx` — redirects to `/login` when signed out
- `src/components/SuperAdminRoute.tsx` — redirects to `/inventory` unless the profile's role is `superadmin`
- `src/pages/Login.tsx`, `Register.tsx` — auth forms
- `src/pages/Profile.tsx` — signed-in user view
- `src/pages/Inventory.tsx`, `src/components/InventoryFormModal.tsx` — inventory CRUD
- `src/pages/Users.tsx` — superadmin user management module
- `supabase/migrations/` — `inventory` table, `profiles` table, roles, triggers, and RLS policies
- `supabase/functions/admin-delete-user/` — Edge Function that deletes an auth user (service-role only, server-side)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build