# Auto Seed Guide - Supabase Edge Function

## 🔧 **AUTO SEED FUNCTION CREATED**

**Objective**: Automatically sync users between Supabase Auth and profiles table  
**File Created**: `supabase/functions/seed-profiles/index.ts`  
**Status**: ✅ **READY**  

---

## ✅ **EDGE FUNCTION FEATURES**

### **1. Automatic User Discovery** ✅
**Fetches**: All users from Supabase Auth automatically

```typescript
// ✅ Step 1: Fetch all Auth users
const { data: users, error: userError } = await supabase.auth.admin.listUsers();
if (userError) throw userError;

console.log("🔍 Found users:", users.users.length);
```

### **2. Email-Based Matching** ✅
**Matches**: Demo users by email address

```typescript
// ✅ Step 2: Match admin & guard users by email
const demoUsers = [
  { email: "admin@example.com", full_name: "Admin User", role: "admin" },
  { email: "guard@example.com", full_name: "Guard User", role: "guard" },
];
```

### **3. Automatic Profile Creation** ✅
**Creates**: Profiles with correct UUIDs and roles

```typescript
// ✅ Step 3: Insert or update profile
const { error: insertError } = await supabase
  .from("profiles")
  .upsert({
    id: foundUser.id,
    full_name: demo.full_name,
    role: demo.role,
    created_at: new Date().toISOString(),
  });
```

### **4. Error Handling** ✅
**Handles**: Missing users and database errors gracefully

```typescript
if (!foundUser) {
  console.warn(`⚠️ User ${demo.email} not found in auth.users`);
  continue;
}
```

---

## 🎯 **SETUP INSTRUCTIONS**

### **Step 1: Set Environment Variables** ✅
1. **Open Supabase Dashboard**
2. **Go to Project → Settings → Functions → Secrets**
3. **Add these secrets**:
   - `SUPABASE_URL`: `https://kpukhpavdxidnoexfljv.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `<your_service_role_key>`

⚠️ **Important**: Use `service_role_key`, NOT `anon key` (service key has admin privileges)

### **Step 2: Deploy the Function** ✅
```bash
supabase functions deploy seed-profiles --project-ref kpukhpavdxidnoexfljv
```

### **Step 3: Create Demo Users** ✅
1. **Go to Authentication → Users**
2. **Create Admin User**:
   - Email: `admin@example.com`
   - Password: `admin123`
3. **Create Guard User**:
   - Email: `guard@example.com`
   - Password: `guard123`

### **Step 4: Run the Function** ✅
```bash
curl -X POST "https://kpukhpavdxidnoexfljv.functions.supabase.co/seed-profiles"
```

---

## 📊 **EXPECTED OUTPUT**

### **Console Output** ✅
```
🔍 Found users: 2
✅ Linking admin@example.com → 1234-uuid-5678-9abc-def0-123456789abc
✅ Linking guard@example.com → 5678-uuid-9abc-def0-1234-56789abcdef0
✅ Profiles seeded successfully
```

### **Response JSON** ✅
```json
{
  "success": true,
  "message": "Profiles seeded successfully"
}
```

### **Database Result** ✅
| Email | Role | Redirect | Dashboard Access |
|-------|------|----------|------------------|
| `admin@example.com` | `admin` | `/admin` | ✅ Admin Dashboard |
| `guard@example.com` | `guard` | `/guard` | ✅ Guard Dashboard |

---

## 🔍 **VERIFICATION STEPS**

### **Check Function Logs** ✅
1. **Go to Supabase Dashboard**
2. **Navigate to Functions → seed-profiles**
3. **Check logs for success messages**

### **Verify Profiles Table** ✅
```sql
-- Check if profiles were created
SELECT * FROM public.profiles;
```

### **Test Login Flow** ✅
1. **Login as admin** → Should redirect to `/admin`
2. **Login as guard** → Should redirect to `/guard`
3. **Check navigation** → Should show appropriate dashboard

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues** ✅

**Issue**: "Function not found" error
**Solution**: Ensure function is deployed correctly

**Issue**: "Service role key invalid" error
**Solution**: Check environment variables in Supabase secrets

**Issue**: "User not found" warning
**Solution**: Ensure demo users exist in Supabase Auth

**Issue**: "Database error" during insert
**Solution**: Check profiles table exists and RLS policies

### **Debug Steps** ✅
1. **Check function deployment**: `supabase functions list`
2. **Verify environment variables**: In Supabase secrets
3. **Check user existence**: In Authentication → Users
4. **Test function manually**: Using curl command

---

## 🚀 **ADVANCED USAGE**

### **Add New Users** ✅
1. **Create user in Supabase Auth**
2. **Update demoUsers array** in function
3. **Redeploy function**: `supabase functions deploy seed-profiles`
4. **Run function**: `curl -X POST "https://kpukhpavdxidnoexfljv.functions.supabase.co/seed-profiles"`

### **Customize User Roles** ✅
```typescript
const demoUsers = [
  { email: "admin@example.com", full_name: "Admin User", role: "admin" },
  { email: "guard@example.com", full_name: "Guard User", role: "guard" },
  { email: "manager@example.com", full_name: "Manager User", role: "admin" },
];
```

### **Automated Scheduling** ✅
- **Cron Jobs**: Set up automated function calls
- **Webhooks**: Trigger on user creation
- **Manual Triggers**: Run when needed

---

## ✅ **VERIFICATION CHECKLIST**

- ✅ **Function deployed**: `seed-profiles` function active
- ✅ **Environment variables**: SUPABASE_URL and SERVICE_ROLE_KEY set
- ✅ **Demo users created**: Admin and guard users in auth
- ✅ **Function executed**: Success response received
- ✅ **Profiles created**: Records in profiles table
- ✅ **Login redirects**: Working properly
- ✅ **Role-based access**: Different dashboards for different roles
- ✅ **No manual UUIDs**: Automatic linking working

---

## 🎉 **RESULT**

After running the auto seed function, you will have:
- ✅ **Automatic user sync** between Auth and profiles
- ✅ **No manual UUID copying** required
- ✅ **Working login redirects** to appropriate dashboards
- ✅ **Role-based navigation** with proper access control
- ✅ **Scalable solution** for adding new users
- ✅ **Enterprise-grade automation** for user management

**The AHE SmartGate system now has automatic user synchronization! 🚀**

---

## 🔧 **TECHNICAL DETAILS**

### **Edge Function Features**:
- **Automatic Discovery**: Fetches all users from auth.users
- **Email Matching**: Links users by email address
- **Profile Creation**: Automatically creates profiles with correct UUIDs
- **Error Handling**: Graceful handling of missing users
- **Upsert Logic**: Updates existing profiles or creates new ones

### **Security Features**:
- **Service Role Key**: Admin privileges for user management
- **Environment Variables**: Secure credential management
- **Error Logging**: Detailed error messages for debugging
- **Graceful Failures**: Continues processing even if some users fail

**The auto seed function ensures seamless user management without manual intervention! 🎯**
