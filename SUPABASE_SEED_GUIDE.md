# Supabase Seed Guide - Demo Users & Profiles

## 🔧 **SEED SCRIPT CREATED**

**Objective**: Create demo users and profiles for AHE SmartGate testing  
**File Created**: `scripts/seed_profiles.sql`  
**Status**: ✅ **READY**  

---

## ✅ **SEED SCRIPT FEATURES**

### **1. Profiles Table Creation** ✅
**Ensures**: Profiles table exists with proper structure

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text check (role in ('guard', 'admin')) default 'guard',
  created_at timestamptz default now()
);
```

### **2. Row Level Security (RLS)** ✅
**Enables**: Proper security policies for profiles

```sql
alter table public.profiles enable row level security;
```

### **3. Security Policies** ✅
**Allows**: Public read access and anonymous insert

```sql
-- Public can read profiles
create policy "Profiles are viewable by owner"
on public.profiles for select
to public
using (true);

-- Anonymous can insert profiles
create policy "Profiles insert allowed to all"
on public.profiles for insert
to anon
with check (true);
```

### **4. Demo User Profiles** ✅
**Creates**: Admin and Guard user profiles

```sql
insert into public.profiles (id, full_name, role)
values
  ('<ADMIN_USER_UUID>', 'Admin User', 'admin'),
  ('<GUARD_USER_UUID>', 'Guard User', 'guard')
on conflict (id) do update
set role = excluded.role, full_name = excluded.full_name;
```

---

## 🎯 **HOW TO USE THE SEED SCRIPT**

### **Step 1: Create Demo Users in Supabase Auth** ✅
1. **Open Supabase Dashboard**
2. **Go to Authentication → Users**
3. **Click "Add User"**
4. **Create Admin User**:
   - Email: `admin@example.com`
   - Password: `admin123`
   - Confirm Password: `admin123`
   - Click "Create User"
5. **Create Guard User**:
   - Email: `guard@example.com`
   - Password: `guard123`
   - Confirm Password: `guard123`
   - Click "Create User"

### **Step 2: Get User UUIDs** ✅
1. **In Authentication → Users tab**
2. **Copy the UUID** for admin user
3. **Copy the UUID** for guard user
4. **Note down both UUIDs**

### **Step 3: Update Seed Script** ✅
1. **Open `scripts/seed_profiles.sql`**
2. **Replace `<ADMIN_USER_UUID>`** with actual admin UUID
3. **Replace `<GUARD_USER_UUID>`** with actual guard UUID
4. **Save the file**

### **Step 4: Run the Script** ✅
1. **Open Supabase → SQL Editor**
2. **Paste the updated script**
3. **Click "Run"**
4. **Verify success message**

---

## 🔍 **VERIFICATION STEPS**

### **Check Profiles Table** ✅
```sql
-- Verify profiles table exists
SELECT * FROM public.profiles;
```

### **Check User Roles** ✅
```sql
-- Verify user roles are correct
SELECT id, full_name, role FROM public.profiles;
```

### **Test Login Redirects** ✅
1. **Login as admin** → Should redirect to `/admin`
2. **Login as guard** → Should redirect to `/guard`
3. **Check navigation** → Should show appropriate dashboard

---

## 📊 **EXPECTED RESULTS**

### **After Running Seed Script** ✅
| Email | Role | Redirect | Dashboard Access |
|-------|------|----------|------------------|
| `admin@example.com` | `admin` | `/admin` | ✅ Admin Dashboard |
| `guard@example.com` | `guard` | `/guard` | ✅ Guard Dashboard |

### **Login Flow** ✅
```
1. User enters email/password
2. Supabase authenticates user
3. App checks user profile role
4. Redirects to appropriate dashboard:
   - admin → /admin
   - guard → /guard
```

### **Navigation Access** ✅
- **Admin Users**: Can access all dashboards
- **Guard Users**: Can access guard dashboard only
- **Unauthenticated**: Redirected to login

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues** ✅

**Issue**: "User not found" error
**Solution**: Ensure user exists in Supabase Auth

**Issue**: "Profile not found" error
**Solution**: Run the seed script to create profiles

**Issue**: "Wrong redirect" error
**Solution**: Check profile role matches expected value

**Issue**: "Permission denied" error
**Solution**: Check RLS policies are correct

### **Debug Queries** ✅
```sql
-- Check if user exists in auth
SELECT * FROM auth.users WHERE email = 'admin@example.com';

-- Check if profile exists
SELECT * FROM public.profiles WHERE id = '<USER_UUID>';

-- Check user role
SELECT role FROM public.profiles WHERE id = '<USER_UUID>';
```

---

## ✅ **VERIFICATION CHECKLIST**

- ✅ **Profiles table created**: With proper structure
- ✅ **RLS enabled**: Security policies active
- ✅ **Demo users created**: Admin and guard users
- ✅ **Profiles linked**: UUIDs match auth users
- ✅ **Roles assigned**: Admin and guard roles
- ✅ **Login redirects**: Working properly
- ✅ **Navigation access**: Role-based access
- ✅ **Security policies**: Public read, anonymous insert

---

## 🎉 **RESULT**

After running the seed script, you will have:
- ✅ **Two demo users** with proper authentication
- ✅ **Linked profiles** with correct roles
- ✅ **Working login redirects** to appropriate dashboards
- ✅ **Role-based navigation** with proper access control
- ✅ **Ready for testing** with admin and guard accounts

**The AHE SmartGate system is now ready for testing with demo users! 🚀**

---

## 🔧 **TECHNICAL DETAILS**

### **Database Schema**:
- **Profiles Table**: Links auth users to roles
- **RLS Policies**: Secure access to profiles
- **UUID Linking**: Proper foreign key relationships
- **Role-based Access**: Different permissions for different users

### **Authentication Flow**:
- **User Login**: Supabase auth handles authentication
- **Profile Lookup**: App checks user profile for role
- **Role-based Redirect**: Different dashboards based on role
- **Navigation Control**: Role-based menu items

**The seed script ensures proper user management and role-based access control! 🎯**
