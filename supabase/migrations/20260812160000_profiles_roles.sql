-- Profiles + role-based access (user / superadmin).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'superadmin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bypasses RLS (security definer) so policies below can check role without recursion.
create or replace function public.is_superadmin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'superadmin'
  );
$$;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_superadmin(auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_superadmin(auth.uid()));

-- Only superadmins may change role / is_active, even on their own row —
-- silently reverts those columns for anyone else instead of erroring, so
-- ordinary profile edits (full_name) still succeed.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin(auth.uid()) then
    new.role := old.role;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- After registering your first account, promote it manually, e.g.:
-- update public.profiles set role = 'superadmin' where email = 'you@example.com';