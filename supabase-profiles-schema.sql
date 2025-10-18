-- Create profiles table for user roles and information
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('guard', 'admin')) default 'guard',
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Profiles are viewable by owners"
on profiles for select using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update their own profile"
on profiles for update using (auth.uid() = id);

-- Policy: Allow users to insert their own profile (for registration)
create policy "Users can insert their own profile"
on profiles for insert with check (auth.uid() = id);

-- Policy: Admins can view all profiles (for admin dashboard)
create policy "Admins can view all profiles"
on profiles for select using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
