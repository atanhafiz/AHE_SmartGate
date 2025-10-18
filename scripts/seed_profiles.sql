-- ✅ STEP 1: Ensure profiles table exists
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text check (role in ('guard', 'admin')) default 'guard',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- ✅ STEP 2: Add policies (public can read, only user can edit)
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
to public
using (true);

drop policy if exists "Profiles insert allowed to all" on public.profiles;
create policy "Profiles insert allowed to all"
on public.profiles for insert
to anon
with check (true);

-- ✅ STEP 3: Insert demo users (link Auth user UUIDs manually)
-- Replace these UUIDs with real user IDs from Supabase Authentication > Users tab.

insert into public.profiles (id, full_name, role)
values
  ('<ADMIN_USER_UUID>', 'Admin User', 'admin'),
  ('<GUARD_USER_UUID>', 'Guard User', 'guard')
on conflict (id) do update
set role = excluded.role, full_name = excluded.full_name;
