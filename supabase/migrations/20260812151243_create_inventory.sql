-- Run this in the Supabase SQL editor for your project.
-- Auth (users, sessions) is already managed by Supabase; this only adds the inventory table.

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sku text not null,
  quantity integer not null default 0,
  price numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.inventory enable row level security;

-- Each user can only see and manage their own inventory items.
create policy "Users can view their own inventory"
  on public.inventory for select
  using (auth.uid() = user_id);

create policy "Users can insert their own inventory"
  on public.inventory for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own inventory"
  on public.inventory for update
  using (auth.uid() = user_id);

create policy "Users can delete their own inventory"
  on public.inventory for delete
  using (auth.uid() = user_id);